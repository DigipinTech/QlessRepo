import Link from "next/link";
import { QlessMark } from "@/components/brand/qless-mark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <QlessMark className="h-10 w-10" />
      <h1 className="text-3xl font-semibold text-brand-slate-900">Page not found</h1>
      <p className="max-w-sm text-sm text-brand-slate-500">
        The page you&apos;re looking for doesn&apos;t exist, or you may need to sign in first.
      </p>
      <div className="mt-2 flex gap-3">
        <Link href="/" className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted">
          Go home
        </Link>
        <Link href="/login" className="brand-gradient-bg rounded-lg px-4 py-2 text-sm font-semibold text-white">
          Staff sign in
        </Link>
      </div>
    </div>
  );
}
