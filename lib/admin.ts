import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  return adminEmails.includes(session.user.email)
}