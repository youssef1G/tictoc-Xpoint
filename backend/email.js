import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://tictoc-xpoint.vercel.app'

const BRAND = '#AA024D'
const BRAND_DIM = '#FCE7F0'
const ACCENT = '#01DFEA'
const INK = '#0A0D12'
const MUTED = '#6B7280'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'

const SOCIALS = [
  { label: 'WhatsApp', url: 'https://whatsapp.com/channel/0029VbBuyltHrDZWTjbJHy22' },
  { label: 'Telegram', url: 'https://t.me/XpointTicTok' },
  { label: 'Instagram', url: 'https://www.instagram.com/tictoc_x.point' },
  { label: 'Facebook', url: 'https://www.facebook.com/share/1DfqUYxnWp/' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@xpointtectoc' },
]

function orderConfirmationHtml(order) {
  const { customer, items, total } = order
  const trackUrl = `${SITE_URL}/order/${order.id}`
  const siteUrl = SITE_URL

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:14px;color:${INK}">${item.name}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:14px;color:${MUTED};text-align:center">${item.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:14px;color:${INK};text-align:right;font-weight:600">EGP ${Number(item.price * item.quantity).toFixed(0)}</td>
    </tr>
  `).join('')

  const socialsHtml = SOCIALS.map(s => `
    <a href="${s.url}" target="_blank" style="display:inline-block;padding:6px 14px;margin:3px 4px;background:${BRAND_DIM};color:${BRAND};border-radius:9999px;font-size:12px;font-weight:600;text-decoration:none">${s.label}</a>
  `).join('')

  return `
<!DOCTYPE html>
<html dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order confirmed</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">

      <!-- main card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${WHITE};border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)">

        <!-- brand bar -->
        <tr><td style="background:${BRAND};padding:24px 32px;text-align:center">
          <h1 style="margin:0;font-size:20px;font-weight:800;color:${WHITE};letter-spacing:-0.3px">Tic Toc Xpoint</h1>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75)">Order confirmed ✓</p>
        </td></tr>

        <!-- greeting -->
        <tr><td style="padding:28px 32px 0">
          <p style="margin:0 0 4px;font-size:15px;color:${MUTED}">Hi${customer.name ? ' ' + customer.name : ''},</p>
          <p style="margin:0;font-size:15px;color:${MUTED}">Thanks for your order! We've received it and will start processing it shortly.</p>
        </td></tr>

        <!-- order id box -->
        <tr><td style="padding:20px 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_DIM};border-radius:12px;padding:16px 20px">
            <tr><td style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;padding-bottom:2px">Order ID</td></tr>
            <tr><td style="font-size:15px;font-weight:700;color:${INK};font-family:ui-monospace,SFMono-Regular,monospace">${order.id}</td></tr>
          </table>
        </td></tr>

        <!-- details 2-col -->
        <tr><td style="padding:0 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:0 12px 0 0;width:50%;vertical-align:top">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;padding-bottom:4px">Delivery address</td></tr>
                  <tr><td style="font-size:14px;color:${INK};padding-bottom:12px">${customer.address}, ${customer.city}</td></tr>
                  <tr><td style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;padding-bottom:4px">Payment</td></tr>
                  <tr><td style="font-size:14px;color:${INK}">Cash on delivery</td></tr>
                </table>
              </td>
              <td style="padding:0 0 0 12px;width:50%;vertical-align:top">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;padding-bottom:4px">Contact</td></tr>
                  <tr><td style="font-size:14px;color:${INK};padding-bottom:2px">${customer.name}</td></tr>
                  <tr><td style="font-size:14px;color:${INK};padding-bottom:2px">${customer.phone}</td></tr>
                  ${customer.email ? `<tr><td style="font-size:14px;color:${MUTED}">${customer.email}</td></tr>` : ''}
                </table>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- items heading -->
        <tr><td style="padding:20px 32px 0;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em">Items</td></tr>

        <!-- items table -->
        <tr><td style="padding:8px 16px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em">
                <th align="left" style="padding:8px 16px;border-bottom:2px solid #E5E7EB">Item</th>
                <th align="center" style="padding:8px 16px;border-bottom:2px solid #E5E7EB">Qty</th>
                <th align="right" style="padding:8px 16px;border-bottom:2px solid #E5E7EB">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
        </td></tr>

        <!-- totals breakdown -->
        <tr><td style="padding:16px 32px 8px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:${MUTED}">Subtotal</td>
              <td style="font-size:14px;color:${INK};text-align:right;font-weight:600">EGP ${Number(order.subtotal || total).toFixed(0)}</td>
            </tr>
            <tr>
              <td style="font-size:14px;color:${MUTED};padding-top:6px">Shipping</td>
              <td style="font-size:14px;color:${INK};text-align:right;padding-top:6px;font-weight:600">${order.shippingFee > 0 ? 'EGP ' + Number(order.shippingFee).toFixed(0) : 'Free'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 0 0"><div style="height:1px;background:#E5E7EB"></div></td>
            </tr>
            <tr>
              <td style="font-size:15px;color:${INK};font-weight:700;padding-top:8px">Total</td>
              <td style="font-size:20px;color:${BRAND};text-align:right;font-weight:800;padding-top:8px">EGP ${Number(total).toFixed(0)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- track button -->
        <tr><td style="padding:0 32px 28px;text-align:center">
          <a href="${trackUrl}" target="_blank" style="display:inline-block;background:${BRAND};color:${WHITE};padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.02em">Track your order →</a>
        </td></tr>

        <!-- spacer / accent line -->
        <tr><td style="padding:0 32px"><div style="height:2px;background:linear-gradient(90deg,${BRAND},${ACCENT});border-radius:2px"></div></td></tr>

        <!-- follow us -->
        <tr><td style="padding:24px 32px 0;text-align:center">
          <p style="margin:0 0 10px;font-size:12px;color:${MUTED}">Follow us</p>
          <div style="text-align:center">${socialsHtml}</div>
        </td></tr>

        <!-- footer -->
        <tr><td style="padding:20px 32px 28px;text-align:center">
          <p style="margin:0;font-size:11px;color:#B0B7C3">
            <a href="${siteUrl}" target="_blank" style="color:${BRAND};text-decoration:none">Tic Toc Xpoint</a>
            &nbsp;·&nbsp; ${new Date().getFullYear()}
          </p>
        </td></tr>

      </table>

      <p style="margin:16px 0 0;font-size:11px;color:#B0B7C3;text-align:center;max-width:480px">
        You're receiving this because you placed an order at Tic Toc Xpoint.
        If you didn't place this order, please ignore this email.
      </p>

    </td></tr></table>
</body>
</html>`
}

export async function sendOrderConfirmation(order) {
  const email = order.customer?.email
  if (!email) return

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Order confirmed — ${order.id} · Tic Toc Xpoint`,
      html: orderConfirmationHtml(order),
    })
    console.log(`Order confirmation sent to ${email} for ${order.id}`)
  } catch (err) {
    console.error(`Failed to send confirmation for ${order.id}:`, err)
  }
}
