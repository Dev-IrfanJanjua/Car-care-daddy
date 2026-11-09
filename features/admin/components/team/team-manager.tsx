'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  addTeamMember,
  setMemberRole,
  type MemberRole,
  resetMemberPassword,
  type TeamMember,
} from '../../actions/team'

function msg(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback
}

export function TeamManager({ members, currentUserId }: { members: TeamMember[]; currentUserId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [superAdmin, setSuperAdmin] = useState(false)
  const [resetFor, setResetFor] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  function run(fn: () => Promise<unknown>, ok: string, after?: () => void) {
    startTransition(async () => {
      try {
        await fn()
        toast.success(ok)
        after?.()
        router.refresh()
      } catch (e) {
        toast.error(msg(e, 'Something went wrong'))
      }
    })
  }

  function add() {
    run(
      async () => {
        const r = await addTeamMember({ email, fullName: name, password, superAdmin })
        if (r.existing) toast.message('That email already had an account, so it was given admin access and kept its password.')
      },
      'Team member added',
      () => {
        setEmail('')
        setName('')
        setPassword('')
        setSuperAdmin(false)
      }
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Admins can use everything in this panel. Only super admins can add people and change roles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a team member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Full name</Label>
              <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-email">Email</Label>
              <Input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="t-pass">Temporary password (min 10 characters)</Label>
              <Input id="t-pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={superAdmin}
              onChange={(e) => setSuperAdmin(e.target.checked)}
              className="mt-1 size-4 accent-[var(--brand)]"
            />
            <span className="text-sm">
              <span className="block font-medium">Make super admin</span>
              <span className="block text-xs text-muted-foreground">Can also add team members and change roles.</span>
            </span>
          </label>
          <Button onClick={add} disabled={pending || !email || !password}>
            {pending ? 'Working…' : 'Add team member'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People with admin access ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {members.map((m) => {
              const isMe = m.id === currentUserId
              return (
                <li key={m.id} className="space-y-3 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {m.name || m.email} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                    </div>
                    <Badge variant="outline">{m.isSuperAdmin ? 'Super admin' : 'Admin'}</Badge>
                  </div>

                  {!isMe && (
                    <div className="flex flex-wrap gap-2">
                      <select
                        aria-label={`Role for ${m.email}`}
                        value={m.isSuperAdmin ? 'super_admin' : 'admin'}
                        disabled={pending}
                        onChange={(e) => {
                          const role = e.target.value as MemberRole
                          if (role === 'customer' && !window.confirm(`Remove admin access for ${m.email}? They become a normal customer account.`)) return
                          run(() => setMemberRole(m.id, role), role === 'customer' ? 'Admin access removed' : 'Role updated')
                        }}
                        className="h-8 rounded-lg border border-border bg-background px-3 text-sm"
                      >
                        <option value="super_admin">Super admin</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer (no admin access)</option>
                      </select>
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => setResetFor(resetFor === m.id ? null : m.id)}>
                        Reset password
                      </Button>
                    </div>
                  )}

                  {resetFor === m.id && (
                    <div className="flex gap-2">
                      <Input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 10 characters)"
                        autoComplete="off"
                      />
                      <Button
                        disabled={pending || !newPassword}
                        onClick={() =>
                          run(() => resetMemberPassword(m.id, newPassword), 'Password updated', () => {
                            setResetFor(null)
                            setNewPassword('')
                          })
                        }
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
