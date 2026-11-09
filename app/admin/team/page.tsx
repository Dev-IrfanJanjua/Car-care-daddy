import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdminUser } from '@/lib/auth/require-super-admin'
import { listTeam } from '@/features/admin/actions/team'
import { TeamManager } from '@/features/admin/components/team/team-manager'

export default async function AdminTeamPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Plain admins are sent back to the dashboard; the actions refuse them too.
  if (!user || !(await isSuperAdminUser(supabase, user.id))) redirect('/admin')

  const members = await listTeam()
  return <TeamManager members={members} currentUserId={user.id} />
}
