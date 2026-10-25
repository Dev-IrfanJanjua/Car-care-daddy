import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from './login-form'

export const metadata = { title: 'Staff sign in', robots: { index: false } }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <main id="main" className="grid min-h-screen lg:grid-cols-2">
      <div className="zone-dark relative hidden items-end overflow-hidden bg-ink-900 p-14 lg:flex">
        <Image src="/images/service-detailing.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,var(--ink-900)_0%,transparent_70%)]" />
        <div className="relative max-w-[26rem]">
          <h2 className="mb-3 font-display text-[2.2rem] leading-[1.15] font-semibold tracking-[-0.03em] text-chrome-100">
            Run Car Aurum <span className="text-gold-ink">your way</span>
          </h2>
          <p className="text-chrome-400">Update your website, add before &amp; after work, and manage bookings — all from one place.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Image src="/images/icon-app.png" alt="Car Aurum" width={56} height={56} priority className="size-14 rounded-[13px]" />
          <h1 className="mt-5 font-display text-[1.8rem] font-semibold tracking-[-0.02em] text-chrome-100">Welcome back</h1>
          <p className="mt-1 mb-7 text-chrome-400">Sign in to the admin panel.</p>
          <LoginForm redirectTo={redirectTo ?? '/admin'} />
          <p className="mt-6">
            <Link href="/" className="font-semibold text-gold-ink hover:underline">
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
