// CallMeBot WhatsApp transport -- admin alerts only.
//
// CallMeBot's free API is personal-use: it will only deliver to the number that
// opted in by messaging the bot. That makes it a good fit for notifying the shop
// owner and a non-option for messaging customers, which is why nothing here is
// wired into the customer-facing flow. Customer WhatsApp would need Meta's
// Cloud API, where business-initiated utility templates are billed per message.
//
// Same contract as the email transport: never throws, logs its failures, and
// no-ops when unconfigured.

const ENDPOINT = 'https://api.callmebot.com/whatsapp.php'

export async function sendAdminWhatsApp(text: string): Promise<boolean> {
  const phone = process.env.CALLMEBOT_PHONE
  const apiKey = process.env.CALLMEBOT_API_KEY

  if (!phone || !apiKey) return false

  // encodeURIComponent turns newlines into %0A, which CallMeBot renders as real
  // line breaks -- so the alert keeps its layout.
  const url = `${ENDPOINT}?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(
    text
  )}&apikey=${encodeURIComponent(apiKey)}`

  try {
    const res = await fetch(url, { method: 'GET' })

    if (!res.ok) {
      console.error(`[callmebot] send failed ${res.status}: ${await res.text()}`)
      return false
    }

    return true
  } catch (error) {
    console.error('[callmebot] request threw', error)
    return false
  }
}
