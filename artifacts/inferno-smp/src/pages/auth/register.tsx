import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Flame } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Min 3 characters").max(16, "Max 16 characters"),
  password: z.string().min(6, "Min 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const registerMutation = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data: { username: values.username, password: values.password } }, {
      onSuccess: () => {
        toast({ title: "Account Created!", description: "Welcome to Inferno SMP." });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({ title: "Registration Failed", description: err.error || "Failed to create account.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4" style={{ paddingTop: "64px" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(255,85,0,0.08),transparent)]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl bg-card border border-border/70 p-8 shadow-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,85,0,0.08), 0 24px 64px -12px rgba(0,0,0,0.9)" }}>

          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.5)] mb-4">
              <Flame className="h-6 w-6 text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join the Inferno SMP community</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                {...register("username")}
                placeholder="YourUsername"
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 rounded-xl text-sm font-bold text-white bg-primary glow-button mt-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {registerMutation.isPending ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
