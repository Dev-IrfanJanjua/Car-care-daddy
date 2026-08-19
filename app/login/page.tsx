import { LoginForm } from './login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <main className="mx-auto flex w-full min-h-screen max-w-sm items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <div className="mx-auto flex size-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-foreground">
            C
          </div>
          <CardTitle className="text-center text-2xl">Staff sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo ?? '/admin'} />
        </CardContent>
      </Card>
    </main>
  )
}
