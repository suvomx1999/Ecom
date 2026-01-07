import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'suvo@gmail.com';
  const password = await bcrypt.hash('suvo1234', 10);
  const oldEmail = 'admin@example.com';

  // Check if the user with the new email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
      console.log(`User with email ${email} already exists. Updating password.`);
      await prisma.user.update({
          where: { email },
          data: {
              password,
          }
      });
  } else {
      // Try to find the old admin user
      const oldAdmin = await prisma.user.findUnique({
          where: { email: oldEmail }
      });

      if (oldAdmin) {
          console.log(`Updating admin email from ${oldEmail} to ${email} and setting new password.`);
          await prisma.user.update({
            where: { email: oldEmail },
            data: {
              email,
              password,
            },
          });
      } else {
          console.log(`Old admin ${oldEmail} not found. Creating new admin ${email}.`);
           await prisma.user.create({
            data: {
              email,
              name: 'Admin User',
              password,
              role: 'ADMIN',
            },
          });
      }
  }

  console.log(`Admin credentials updated: ${email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
