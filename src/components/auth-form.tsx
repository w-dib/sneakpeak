"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      "http://localhost:3000/";
    // Make sure to include `https` in production URLs.
    url = url.includes("http") ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
    url = `${url}auth/callback`;
    return url;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getURL(),
      },
    });
    setLoading(false);
  };

  const signInWithGitHub = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: getURL(),
      },
    });
    setLoading(false);
  };

  const signInWithMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getURL(),
      },
    });
    if (error) {
      setMessage("Could not authenticate. Please try again.");
    } else {
      setMessage("Check your email for the magic link!");
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in to access your projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            variant="outline"
            onClick={signInWithGitHub}
            disabled={loading}
          >
            <FaGithub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or with your email
            </span>
          </div>
        </div>

        <form onSubmit={signInWithMagicLink}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              placeholder="you@example.com"
              required
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              disabled={loading}
            />
          </div>
          <Button className="w-full mt-4" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Magic Link"}
          </Button>
        </form>
        {message && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
