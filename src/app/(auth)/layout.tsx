import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Top Logo */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <Logo size="lg" />
      </div>

      {/* Centered Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-6">
        © {new Date().getFullYear()} TalentHub. All rights reserved.
      </p>
    </div>
  );
}
