// Tells the shop when someone sends a message through the contact form.
// Same pattern as new-booking-alert: email + WhatsApp, independent channels,
// never throws, so a notification outage can't lose or slow down a message
// that is already saved.

import { sendEmail } from '@/lib/email/brevo'
import { sendAdminWhatsApp } from '@/lib/whatsapp/callmebot'
import { escapeHtml, siteUrl } from '@/lib/email/booking-links'

export type NewLeadAlert = {
  name: string
  phone: string
  email: string
  service: string
  message: string
}

export async function notifyAdminOfNewLead(lead: NewLeadAlert) {
  const adminEmail = process.env.ADMIN_EMAIL
  const url = `${siteUrl()}/admin/leads`

  const whatsapp = [
    '💬 *New message from the website*',
    '',
    `*${lead.name}*`,
    lead.phone,
    ...(lead.email ? [lead.email] : []),
    ...(lead.service ? [`Service: ${lead.service}`] : []),
    '',
    lead.message,
    '',
    url,
  ].join('\n')

  const html = `
    <h2>New message from the website</h2>
    <p><strong>${escapeHtml(lead.name)}</strong><br/>
    ${escapeHtml(lead.phone)}${lead.email ? `<br/>${escapeHtml(lead.email)}` : ''}</p>
    ${lead.service ? `<p><strong>Service:</strong> ${escapeHtml(lead.service)}</p>` : ''}
    <p style="white-space:pre-wrap">${escapeHtml(lead.message)}</p>
    <p><a href="${url}">Open in admin</a></p>
  `

  await Promise.allSettled([
    adminEmail
      ? sendEmail({ to: adminEmail, subject: `New message — ${lead.name}`, html })
      : Promise.resolve(false),
    sendAdminWhatsApp(whatsapp),
  ])
}
