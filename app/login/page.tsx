import Image from 'next/image'
import { LoginForm } from './login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Staff sign in', robots: { index: false } }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <main id="main" className="mx-auto flex w-full min-h-screen max-w-sm items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <Image src="/images/logo-light.png" alt="Car Aurum" width={720} height={305} priority className="logo-on-light mx-auto h-14 w-auto" />
          <Image src="/images/logo-dark.png" alt="Car Aurum" width={720} height={305} priority className="logo-on-dark mx-auto h-14 w-auto" />
          <CardTitle className="text-center text-2xl">Staff sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo ?? '/admin'} />
        </CardContent>
      </Card>
    </main>
  )
}
