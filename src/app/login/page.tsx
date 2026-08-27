import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ROLE_HOME_PATH } from "@/lib/auth/constants";
import { LoginForm } from "@/components/auth/login-form";
import { QlessMark } from "@/components/brand/qless-mark";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME_PATH[session.role]);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="brand-gradient-bg relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <QlessMark className="h-8 w-8" variant="light" />
          <span className="text-lg font-semibold tracking-tight">QLess</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            One login. Every queue in your hospital, live.
          </h2>
          <p className="mt-4 text-white/85">
            Staff sign in here to manage doctors, tokens and the live queue.
            Patients don&apos;t need an account — they track their token from
            an SMS/WhatsApp link or the public display board.
          </p>
        </div>
        <p className="text-sm text-white/70">
          Hospital &amp; Clinic Queue Module — Phase 1 demo
        </p>
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10"
        />
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <QlessMark className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight">QLess</span>
        </div>
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold text-brand-slate-900">Staff sign in</h1>
          <p className="mt-1 mb-6 text-sm text-brand-slate-500">
            Access your hospital&apos;s QLess dashboard.
          </p>
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="mt-8 text-center text-sm text-brand-slate-500">
            <Link href="/" className="font-medium text-brand-blue-600 hover:underline">
              ← Back to qless.app
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
