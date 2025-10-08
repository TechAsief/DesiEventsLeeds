import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordSchema, type ForgotPasswordData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setEmailSent(true);
      toast({
        title: "Email sent!",
        description: data.message || "Check your email for password reset instructions",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send email",
        description: error.message || "Please try again later",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordData) => {
    forgotPasswordMutation.mutate(data);
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent password reset instructions to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              If you don't see the email in your inbox, please check your spam folder.
            </p>
            <p className="text-sm text-muted-foreground">
              The reset link will expire in 1 hour for security reasons.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
              <Button
                onClick={() => setEmailSent(false)}
                variant="ghost"
                className="w-full"
                data-testid="button-try-different-email"
              >
                Try Different Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      data-testid="input-forgot-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={forgotPasswordMutation.isPending}
              data-testid="button-send-reset"
            >
              {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-sm"
            data-testid="button-back-to-login"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
