import { tServer } from "@/lib/preferences";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="heading-display flex items-center justify-center gap-2 text-3xl">
            <span className="text-rune-400">✦</span>
            {tServer("app.name")}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
