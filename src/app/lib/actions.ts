'use server';

import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'SELLER']),
});

export async function register(
  prevState: any,
  formData: FormData,
) {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Missing Fields. Failed to Register.',
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { message: 'User already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
      },
    });

  } catch (error) {
    return {
      message: 'Database Error: Failed to Create User.',
    };
  }
  
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid credentials.' };
        default:
          return { message: 'Something went wrong.' };
      }
    }
    throw error;
  }
}

const ProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(0.01),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().optional(),
});

export async function createProduct(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'SELLER') {
    return { message: 'Unauthorized' };
  }

  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId'),
  });

  if (!validatedFields.success) {
    return { message: 'Invalid fields' };
  }

  const { name, description, price, stock, categoryId } = validatedFields.data;
  
  let imageUrl = '';
  const imageFile = formData.get('image') as File;
  if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = join(process.cwd(), 'public/uploads');
      await mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${imageFile.name}`;
      await writeFile(join(uploadDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });
    if (!user) return { message: 'User not found' };

    await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
        categoryId: categoryId || undefined,
        sellerId: user.id,
      },
    });

    revalidatePath('/seller/products');
    return { message: 'Product created successfully' };
  } catch (error) {
    return { message: 'Failed to create product' };
  }
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || (session.user as any).role !== 'SELLER') {
      return { message: 'Unauthorized' };
    }

    const validatedFields = ProductSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        stock: formData.get('stock'),
        categoryId: formData.get('categoryId'),
    });

    if (!validatedFields.success) {
        return { message: 'Invalid fields' };
    }

    const { name, description, price, stock, categoryId } = validatedFields.data;

    let imageUrl = undefined;
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });
        const filename = `${Date.now()}-${imageFile.name}`;
        await writeFile(join(uploadDir, filename), buffer);
        imageUrl = `/uploads/${filename}`;
    }

    try {
        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                stock,
                imageUrl, 
                categoryId: categoryId || null,
            }
        });
        revalidatePath('/seller/products');
        return { message: 'Product updated successfully' };
    } catch (error) {
        return { message: 'Failed to update product' };
    }
}

export async function deleteProduct(id: string) {
    const session = await auth();
    if (!session || (session.user as any).role !== 'SELLER') {
      return { message: 'Unauthorized' };
    }
    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath('/seller/products');
        return { message: 'Product deleted' };
    } catch (error) {
        return { message: 'Failed to delete product' };
    }
}

export async function addToCart(productId: string) {
  const session = await auth();
  if (!session?.user?.email) {
     return { message: 'Please log in to add items to cart' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { message: 'User not found' };

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { message: 'Product not found' };

    let order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      },
      include: { items: true }
    });

    if (!order) {
      order = await prisma.order.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          total: 0,
        },
        include: { items: true }
      });
    }

    const existingItem = order.items.find(item => item.productId === productId);

    if (existingItem) {
      await prisma.orderItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 }
      });
    } else {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: productId,
          quantity: 1,
          price: product.price
        }
      });
    }
    
    // Recalculate total
    const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true }
    });
    
    if (updatedOrder) {
        const total = updatedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        await prisma.order.update({
            where: { id: order.id },
            data: { total }
        });
    }

    revalidatePath('/cart');
    revalidatePath('/');
    return { message: 'Added to cart' };
  } catch (error) {
    console.error(error);
    return { message: 'Failed to add to cart' };
  }
}

export async function removeFromCart(itemId: string) {
    const session = await auth();
    if (!session?.user?.email) return { message: 'Unauthorized' };

    try {
        const item = await prisma.orderItem.findUnique({ where: { id: itemId }, include: { order: true } });
        if (!item) return { message: 'Item not found' };

        await prisma.orderItem.delete({ where: { id: itemId } });

        // Update total
        const updatedOrder = await prisma.order.findUnique({
            where: { id: item.orderId },
            include: { items: true }
        });

        if (updatedOrder) {
            const total = updatedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            await prisma.order.update({
                where: { id: item.orderId },
                data: { total }
            });
        }

        revalidatePath('/cart');
        return { message: 'Removed from cart' };
    } catch (error) {
        return { message: 'Failed to remove item' };
    }
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'Unauthorized' };

  try {
    if (quantity <= 0) {
        return removeFromCart(itemId);
    }

    const item = await prisma.orderItem.findUnique({ where: { id: itemId }, include: { order: true } });
    if (!item) return { message: 'Item not found' };

    await prisma.orderItem.update({
        where: { id: itemId },
        data: { quantity }
    });

    // Update total
    const updatedOrder = await prisma.order.findUnique({
        where: { id: item.orderId },
        include: { items: true }
    });

    if (updatedOrder) {
        const total = updatedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        await prisma.order.update({
            where: { id: item.orderId },
            data: { total }
        });
    }

    revalidatePath('/cart');
    return { message: 'Quantity updated' };
  } catch (error) {
    console.error('Failed to update cart quantity:', error);
    return { message: 'Failed to update quantity' };
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'ADMIN') {
    return { message: 'Unauthorized' };
  }

  if (session.user?.id === userId) {
    return { message: 'You cannot delete your own account' };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath('/admin/users');
    return { message: 'User deleted successfully' };
  } catch (error) {
    return { message: 'Failed to delete user' };
  }
}

export async function placeOrder(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: 'Please log in to place an order' };
  }

  const address = formData.get('address') as string;
  if (!address || address.trim().length === 0) {
    return { message: 'Shipping address is required' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { message: 'User not found' };

    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      },
      include: { items: { include: { product: true } } }
    });

    if (!order || order.items.length === 0) {
      return { message: 'Cart is empty' };
    }

    // Check stock for all items
    for (const item of order.items) {
      if (item.quantity > item.product.stock) {
        return { message: `Not enough stock for ${item.product.name}` };
      }
    }

    // Process order in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Decrement stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 2. Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          shippingAddress: address,
        }
      });
    });

    revalidatePath('/', 'layout');
    return { message: 'Order placed successfully', success: true };

  } catch (error) {
    console.error('Failed to place order:', error);
    return { message: 'Failed to place order. Please try again.' };
  }
}

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const password = formData.get('password') as string;

  try {
    const data: any = { name };
    if (password && password.length >= 6) {
        data.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: data,
    });

    revalidatePath('/profile');
    return { message: 'Profile updated successfully' };
  } catch (error) {
    console.error("Update profile error:", error);
    return { message: 'Failed to update profile' };
  }
}
