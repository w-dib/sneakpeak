import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth-form";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <div className="mb-8">
          <Image src="/logo.svg" alt="Sneakpeak logo" width={240} height={64} />
        </div>
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Sneakpeak</h1>
        <p className="text-muted-foreground">
          You are successfully logged in as {user.email}
        </p>
      </div>
    </div>
  );
}
