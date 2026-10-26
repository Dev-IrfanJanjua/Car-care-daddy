import { MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { customerWaUrl, type CustomerTemplate } from '@/lib/whatsapp/customer-messages'
import { toWhatsAppDigits } from '@/lib/phone'

/**
 * One-tap WhatsApp messages to a customer. Each button opens WhatsApp with the
 * customer's number and a ready-written message; nothing is sent until the shop
 * presses send. Used on the booking and lead detail pages.
 */
export function WhatsAppTemplates({ phone, templates, title = 'Message on WhatsApp' }: { phone: string | null; templates: CustomerTemplate[]; title?: string }) {
  const digits = phone ? toWhatsAppDigits(phone) : ''
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {digits ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {templates.map((t) => (
              <li key={t.key}>
                <a
                  href={customerWaUrl(digits, t.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-gold-500 hover:bg-muted"
                >
                  <span className="font-medium">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.hint}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No valid phone number on file for this customer.</p>
        )}
      </CardContent>
    </Card>
  )
}
