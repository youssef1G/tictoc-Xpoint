import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'

function orderConfirmationHtml(order) {
  const { customer, items, total } = order
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right">EGP ${Number(item.price * item.quantity).toFixed(0)}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html dir="ltr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
        <tr><td style="padding:32px 32px 0">
          <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#1a1a1a">Order confirmed ✓</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#666">Thanks ${customer.name || ''}, we've received your order.</p>
        </td></tr>
        <tr><td style="padding:0 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:10px;padding:16px 20px;margin-bottom:20px">
            <tr><td style="font-size:12px;color:#888;padding-bottom:4px">Order ID</td></tr>
            <tr><td style="font-size:14px;font-weight:600;color:#1a1a1a;font-family:monospace">${order.id}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:13px;color:#888;padding-bottom:4px">Delivery address</td></tr>
            <tr><td style="font-size:14px;color:#333;padding-bottom:20px">${customer.address}, ${customer.city}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.05em">
                <th align="left" style="padding:8px 12px;border-bottom:2px solid #eee">Item</th>
                <th align="center" style="padding:8px 12px;border-bottom:2px solid #eee">Qty</th>
                <th align="right" style="padding:8px 12px;border-bottom:2px solid #eee">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px 24px;text-align:right">
          <span style="font-size:13px;color:#888">Total: </span>
          <span style="font-size:20px;font-weight:700;color:#1a1a1a">EGP ${Number(total).toFixed(0)}</span>
        </td></tr>
        <tr><td style="padding:24px 32px;background:#fafafa;border-top:1px solid #eee">
          <p style="margin:0;font-size:12px;color:#999;text-align:center">You'll get a call when your order is on its way. Questions? Reply to this email.</p>
        </td></tr>
      </table>
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
      subject: 'Order confirmed — TicToc Xpoint',
      html: orderConfirmationHtml(order),
    })
    console.log(`Order confirmation sent to ${email} for ${order.id}`)
  } catch (err) {
    console.error(`Failed to send confirmation for ${order.id}:`, err)
  }
}
