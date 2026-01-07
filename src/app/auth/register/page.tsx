import RegisterForm from './register-form';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
             <div>
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline font-medium">
                    Sign in
                </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
