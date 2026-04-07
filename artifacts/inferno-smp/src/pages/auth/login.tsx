import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Login Successful", description: "Welcome back to Inferno SMP!" });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({ 
          title: "Login Failed", 
          description: err.error || "Invalid credentials",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 relative pt-16">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,90,0,0.15),transparent_70%)]" />
      </div>
      
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center pb-8 pt-8">
          <div className="mx-auto w-12 h-12 rounded bg-gradient-to-br from-primary to-destructive flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(255,90,0,0.6)] mb-4">
            I
          </div>
          <CardTitle className="text-3xl font-black tracking-tight glow-text">LOGIN</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minecraft Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Notch" className="bg-background/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="bg-background/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-12 font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 glow-button mt-4"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
