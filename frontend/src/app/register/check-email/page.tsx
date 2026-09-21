import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function CheckEmailPage() {
  return (
    <AuthLayout
      title="Check your email"
      background="transcript"
      subtitle="We sent you a link to confirm your account."
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Mail className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">
          Click the link in that email to finish creating your account. You can close this tab.
        </p>
      </div>
    </AuthLayout>
  );
}
