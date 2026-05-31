import { GuestCartItem, Order } from '../types';

export async function sendOrderEmail(order: Order, cartItems: GuestCartItem[]) {
  const resellerEmail = import.meta.env.VITE_RESELLER_EMAIL;
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (!resendApiKey || !resellerEmail) {
    console.warn('Email config missing, skipping notification');
    return;
  }

  const itemsHtml = cartItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border:1px solid #ddd">${item.product?.name ?? item.product_id}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${(item.product?.price ?? 0).toFixed(2)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${((item.product?.price ?? 0) * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1976d2">🛒 New SmartCart Order Received</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString('en-IN')}</p>

      <h3>Customer Details</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px;color:#666">Name</td><td style="padding:6px"><strong>${order.customer_name}</strong></td></tr>
        <tr><td style="padding:6px;color:#666">Email</td><td style="padding:6px">${order.customer_email}</td></tr>
        <tr><td style="padding:6px;color:#666">Phone</td><td style="padding:6px">${order.customer_phone}</td></tr>
      </table>

      <h3>Shipping Address</h3>
      <p style="background:#f5f5f5;padding:12px;border-radius:6px">
        ${order.address}<br>${order.city}, ${order.state} - ${order.pincode}
      </p>

      <h3>Ordered Products</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#1976d2;color:white">
            <th style="padding:8px;text-align:left">Product</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <h3 style="text-align:right">Total Amount: <span style="color:#1976d2">₹${order.total_amount.toFixed(2)}</span></h3>

      <p style="color:#666;font-size:13px;margin-top:24px">
        This is an automated notification from SmartCart. Please contact the customer to confirm payment and delivery details.
      </p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SmartCart <onboarding@resend.dev>',
      to: [resellerEmail],
      subject: '[SmartCart] New Order Received',
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error: ${err}`);
  }
}
