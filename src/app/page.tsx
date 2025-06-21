import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpDown,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
} from "lucide-react";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground h-full">
      <div className="grid lg:grid-cols-5 gap-8 p-4 md:p-8 h-full">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-semibold flex items-center">
            <RefreshCw className="mr-2 h-5 w-5" />
            Dashboard
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search Jobs" className="pl-10" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <Button variant="ghost" size="icon">
                <Filter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ArrowUpDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" />
              New Job
            </Button>
          </div>
          <Card className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">
                Monitor your first page by creating a new job
              </p>
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" />
                New Job
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Job Changes and Checks</h2>
          <Card className="flex-grow flex items-center justify-center bg-card/50">
            <CardContent>
              <p className="text-muted-foreground">
                Please select a job to view your job&apos;s changes and checks
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
