/**
 * WEARITION — Luxury Email Templates
 * Professional HTML email templates for all customer lifecycle events.
 * Designed to match the storefront's luxury aesthetic.
 */

const BRAND = {
  name: 'WEARITION',
  tagline: 'Modern Luxury. Timeless Craft.',
  logo: 'https://wearition.vercel.app/logo.png', 
  website: 'https://wearition.vercel.app',
  instagram: 'https://instagram.com/wearition',
  whatsapp: '923000000000', 
  supportEmail: 'wearition.80@gmail.com',
  colors: {
    bg: '#0A0A0A',
    card: '#0f0f0f',
    accent: '#D4AF37', // Premium Gold
    text: '#ffffff',
    muted: '#666666',
    white: '#FFFFFF',
    border: '#1a1a1a',
  }
};

// ──────────────── SHARED LAYOUT ────────────────

function emailWrapper(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');
    
    body { margin: 0; padding: 0; background-color: ${BRAND.colors.bg}; font-family: 'Inter', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 640px; margin: 0 auto; background-color: ${BRAND.colors.card}; }
    .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }
    h1, h2, h3 { font-family: 'Cormorant Garamond', 'Times New Roman', serif; font-weight: 400; }
    p, td, span, a { font-family: 'Inter', Arial, sans-serif; }
    a { color: ${BRAND.colors.accent}; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-padding { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.colors.bg};">
  <span class="preheader">${preheader}</span>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.colors.bg};padding:40px 20px;">
    <tr>
      <td align="center">
        <table class="email-container" role="presentation" width="640" cellpadding="0" cellspacing="0" style="background-color:${BRAND.colors.card};border-radius:2px;overflow:hidden;">
          
          <!-- HEADER with Logo -->
          <tr>
            <td style="padding:60px 48px 40px;text-align:center;" class="mobile-padding">
              <a href="${BRAND.website}" target="_blank">
                <img src="${BRAND.logo}" alt="${BRAND.name}" width="220" style="max-width:220px;height:auto;filter:brightness(1.2);" />
              </a>
            </td>
          </tr>

          ${content}
          
          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 48px;border-top:1px solid ${BRAND.colors.border};text-align:center;" class="mobile-padding">
              <p style="color:${BRAND.colors.muted};font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">${BRAND.tagline}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="padding:0 12px;"><a href="${BRAND.website}/shop" style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Shop</a></td>
                  <td style="padding:0 12px;"><a href="${BRAND.instagram}" style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Instagram</a></td>
                  <td style="padding:0 12px;"><a href="https://wa.me/${BRAND.whatsapp}" style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">WhatsApp</a></td>
                </tr>
              </table>
              <p style="color:${BRAND.colors.muted};font-size:10px;margin:0;">
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All Rights Reserved.<br/>
                <a href="${BRAND.website}" style="color:${BRAND.colors.muted};">${BRAND.website.replace('https://', '')}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function goldDivider(): string {
  return `
  <tr>
    <td style="padding:0 48px;" class="mobile-padding">
      <div style="height:1px;background:linear-gradient(90deg, transparent, ${BRAND.colors.accent}, transparent);"></div>
    </td>
  </tr>`;
}

function ctaButton(text: string, url: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto;">
    <tr>
      <td style="background-color:${BRAND.colors.accent};padding:16px 48px;border-radius:1px;">
        <a href="${url}" style="color:${BRAND.colors.bg};font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;text-decoration:none;font-family:'Inter',Arial,sans-serif;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// ──────────────── EMAIL TEMPLATES ────────────────

/**
 * Welcome email sent after user registration
 */
export function welcomeEmail(data: { name: string; email: string }): { subject: string; html: string } {
  const content = `
  <!-- HERO -->
  <tr>
    <td style="padding:56px 48px 24px;text-align:center;" class="mobile-padding">
      <p style="color:${BRAND.colors.accent};font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">Welcome to the Maison</p>
      <h1 style="color:${BRAND.colors.text};font-size:36px;margin:0 0 8px;font-weight:300;letter-spacing:1px;">Hello, ${data.name || 'there'}</h1>
    </td>
  </tr>
  
  ${goldDivider()}

  <tr>
    <td style="padding:32px 48px;" class="mobile-padding">
      <p style="color:${BRAND.colors.text};font-size:14px;line-height:1.8;margin:0 0 24px;text-align:center;">
        Your account has been created successfully. You are now part of an exclusive community that appreciates modern luxury and timeless craftsmanship.
      </p>
      <p style="color:${BRAND.colors.muted};font-size:13px;line-height:1.7;margin:0 0 8px;text-align:center;">
        As a member, you'll enjoy:
      </p>
    </td>
  </tr>

  <!-- BENEFITS -->
  <tr>
    <td style="padding:0 48px 32px;" class="mobile-padding">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:16px 20px;border:1px solid ${BRAND.colors.border};border-radius:2px;margin-bottom:8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="40" style="color:${BRAND.colors.accent};font-size:20px;vertical-align:top;padding-top:2px;">◇</td>
                <td>
                  <p style="color:${BRAND.colors.text};font-size:13px;font-weight:500;margin:0 0 4px;">Early Access</p>
                  <p style="color:${BRAND.colors.muted};font-size:11px;margin:0;line-height:1.5;">Be the first to explore new collections and limited drops.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:16px 20px;border:1px solid ${BRAND.colors.border};border-radius:2px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="40" style="color:${BRAND.colors.accent};font-size:20px;vertical-align:top;padding-top:2px;">◇</td>
                <td>
                  <p style="color:${BRAND.colors.text};font-size:13px;font-weight:500;margin:0 0 4px;">Wishlist & Order Tracking</p>
                  <p style="color:${BRAND.colors.muted};font-size:11px;margin:0;line-height:1.5;">Save your favourites and track every order in real time.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:16px 20px;border:1px solid ${BRAND.colors.border};border-radius:2px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="40" style="color:${BRAND.colors.accent};font-size:20px;vertical-align:top;padding-top:2px;">◇</td>
                <td>
                  <p style="color:${BRAND.colors.text};font-size:13px;font-weight:500;margin:0 0 4px;">Concierge Support</p>
                  <p style="color:${BRAND.colors.muted};font-size:11px;margin:0;line-height:1.5;">Reach us anytime via WhatsApp for personalized styling advice.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 48px 48px;text-align:center;" class="mobile-padding">
      ${ctaButton('Explore Collections', `${BRAND.website}/shop`)}
    </td>
  </tr>`;

  return {
    subject: `Welcome to ${BRAND.name} — Your Account is Ready`,
    html: emailWrapper(content, `Welcome to ${BRAND.name}! Your luxury journey begins now.`)
  };
}

/**
 * Order placed/confirmed email
 */
export function orderPlacedEmail(data: {
  name: string;
  orderId: string;
  items: { title: string; quantity: number; price: number; size?: string; color?: string; image?: string }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: { name: string; address: string; city: string };
}): { subject: string; html: string } {

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid ${BRAND.colors.border};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="72" style="vertical-align:top;">
              <div style="width:64px;height:80px;background:${BRAND.colors.border};border-radius:2px;overflow:hidden;">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" width="64" style="width:64px;height:80px;object-fit:cover;" />` : ''}
              </div>
            </td>
            <td style="vertical-align:top;padding-left:16px;">
              <p style="color:${BRAND.colors.text};font-size:13px;font-weight:500;margin:0 0 6px;">${item.title}</p>
              <p style="color:${BRAND.colors.muted};font-size:11px;margin:0;">
                Qty: ${item.quantity}${item.size ? ` · Size: ${item.size}` : ''}${item.color ? ` · ${item.color}` : ''}
              </p>
            </td>
            <td style="vertical-align:top;text-align:right;">
              <p style="color:${BRAND.colors.text};font-size:13px;font-weight:500;margin:0;">Rs. ${Math.round(item.price * item.quantity).toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const content = `
  <tr>
    <td style="padding:56px 48px 24px;text-align:center;" class="mobile-padding">
      <div style="width:64px;height:64px;border-radius:50%;border:2px solid ${BRAND.colors.accent};margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✓</span>
      </div>
      <p style="color:${BRAND.colors.accent};font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;font-weight:600;">Order Confirmed</p>
      <h1 style="color:${BRAND.colors.text};font-size:32px;margin:0 0 8px;font-weight:300;">Thank you, ${data.name}</h1>
      <p style="color:${BRAND.colors.muted};font-size:13px;margin:0;">Your order has been received and is being prepared.</p>
    </td>
  </tr>
  
  ${goldDivider()}

  <!-- ORDER ID -->
  <tr>
    <td style="padding:32px 48px 16px;" class="mobile-padding">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.colors.bg};border-radius:2px;padding:20px 24px;">
        <tr>
          <td>
            <p style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Order Number</p>
            <p style="color:${BRAND.colors.accent};font-size:22px;font-weight:600;margin:0;letter-spacing:2px;font-family:'Inter',monospace;">${data.orderId}</p>
          </td>
          <td style="text-align:right;vertical-align:bottom;">
            <p style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0;">Status</p>
            <p style="color:${BRAND.colors.text};font-size:12px;font-weight:600;margin:4px 0 0;letter-spacing:1px;">CONFIRMED</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ITEMS -->
  <tr>
    <td style="padding:16px 48px;" class="mobile-padding">
      <p style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">Items Ordered</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${itemsHtml}
      </table>
    </td>
  </tr>

  <!-- TOTALS -->
  <tr>
    <td style="padding:16px 48px 32px;" class="mobile-padding">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;"><p style="color:${BRAND.colors.muted};font-size:12px;margin:0;">Subtotal</p></td>
          <td style="padding:8px 0;text-align:right;"><p style="color:${BRAND.colors.text};font-size:12px;margin:0;">Rs. ${Math.round(data.subtotal).toLocaleString()}</p></td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><p style="color:${BRAND.colors.muted};font-size:12px;margin:0;">Shipping</p></td>
          <td style="padding:8px 0;text-align:right;"><p style="color:${BRAND.colors.text};font-size:12px;margin:0;">Rs. ${Math.round(data.shipping).toLocaleString()}</p></td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px 0;"><div style="height:1px;background:${BRAND.colors.border};"></div></td>
        </tr>
        <tr>
          <td style="padding:12px 0;"><p style="color:${BRAND.colors.text};font-size:14px;font-weight:600;margin:0;">Total</p></td>
          <td style="padding:12px 0;text-align:right;"><p style="color:${BRAND.colors.accent};font-size:18px;font-weight:600;margin:0;">Rs. ${Math.round(data.total).toLocaleString()}</p></td>
        </tr>
      </table>
    </td>
  </tr>

  ${goldDivider()}

  <!-- SHIPPING ADDRESS -->
  <tr>
    <td style="padding:24px 48px;" class="mobile-padding">
      <p style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;font-weight:600;">Shipping To</p>
      <p style="color:${BRAND.colors.text};font-size:13px;line-height:1.7;margin:0;">
        ${data.shippingAddress.name}<br/>
        ${data.shippingAddress.address}<br/>
        ${data.shippingAddress.city}
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:8px 48px 48px;text-align:center;" class="mobile-padding">
      ${ctaButton('Track Your Order', `${BRAND.website}/track-order?id=${data.orderId}`)}
      <p style="color:${BRAND.colors.muted};font-size:11px;margin:16px 0 0;">
        Questions? <a href="https://wa.me/${BRAND.whatsapp}" style="color:${BRAND.colors.accent};">Chat with us on WhatsApp</a>
      </p>
    </td>
  </tr>`;

  return {
    subject: `Order Confirmed — ${data.orderId} | ${BRAND.name}`,
    html: emailWrapper(content, `Your ${BRAND.name} order ${data.orderId} has been confirmed.`)
  };
}

/**
 * Order status update email (processing, shipped, delivered)
 */
export function orderStatusEmail(data: {
  name: string;
  orderId: string;
  status: 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
}): { subject: string; html: string } {
  
  const statusConfig = {
    processing: {
      icon: '⚙',
      label: 'Being Prepared',
      headline: 'Your order is being crafted',
      description: 'Our team is carefully preparing your items with the attention to detail you expect from WEARITION.',
      subject: `Order Processing — ${data.orderId}`,
      preheader: `Your ${BRAND.name} order is being prepared with care.`,
    },
    shipped: {
      icon: '🚚',
      label: 'On Its Way',
      headline: 'Your order is on its way',
      description: 'Your package has been dispatched and is en route to you. Track its journey below.',
      subject: `Order Shipped — ${data.orderId}`,
      preheader: `Your ${BRAND.name} order has been shipped!`,
    },
    delivered: {
      icon: '✦',
      label: 'Delivered',
      headline: 'Your order has arrived',
      description: 'Your WEARITION package has been delivered. We hope you love every piece.',
      subject: `Order Delivered — ${data.orderId}`,
      preheader: `Your ${BRAND.name} order has been delivered!`,
    }
  };

  const config = statusConfig[data.status];

  // Progress bar
  const steps = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStep = data.status === 'processing' ? 1 : data.status === 'shipped' ? 2 : 3;
  
  const progressHtml = steps.map((step, i) => {
    const isActive = i <= currentStep;
    const dotColor = isActive ? BRAND.colors.accent : BRAND.colors.border;
    const textColor = isActive ? BRAND.colors.text : BRAND.colors.muted;
    return `
      <td style="text-align:center;width:25%;">
        <div style="width:12px;height:12px;border-radius:50%;background:${dotColor};margin:0 auto 8px;"></div>
        <p style="color:${textColor};font-size:9px;letter-spacing:1.5px;text-transform:uppercase;margin:0;font-weight:${isActive ? '600' : '400'};">${step}</p>
      </td>`;
  }).join('');

  const trackingSection = data.status === 'shipped' && data.trackingNumber ? `
  <tr>
    <td style="padding:16px 48px;" class="mobile-padding">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.colors.bg};border-radius:2px;padding:24px;">
        <tr>
          <td>
            <p style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;font-weight:600;">Tracking Number</p>
            <p style="color:${BRAND.colors.accent};font-size:20px;font-weight:600;margin:0;letter-spacing:3px;font-family:'Inter',monospace;">${data.trackingNumber}</p>
            ${data.courierName ? `<p style="color:${BRAND.colors.muted};font-size:11px;margin:8px 0 0;">Courier: ${data.courierName}</p>` : ''}
            ${data.estimatedDelivery ? `<p style="color:${BRAND.colors.muted};font-size:11px;margin:4px 0 0;">Estimated delivery: ${data.estimatedDelivery}</p>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>` : '';

  const content = `
  <tr>
    <td style="padding:56px 48px 24px;text-align:center;" class="mobile-padding">
      <div style="font-size:40px;margin:0 0 20px;">${config.icon}</div>
      <p style="color:${BRAND.colors.accent};font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;font-weight:600;">${config.label}</p>
      <h1 style="color:${BRAND.colors.text};font-size:30px;margin:0 0 12px;font-weight:300;">${config.headline}</h1>
      <p style="color:${BRAND.colors.muted};font-size:13px;line-height:1.6;margin:0;max-width:440px;display:inline-block;">${config.description}</p>
    </td>
  </tr>

  ${goldDivider()}

  <!-- ORDER ID -->
  <tr>
    <td style="padding:32px 48px 16px;" class="mobile-padding">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.colors.bg};border-radius:2px;padding:20px 24px;">
        <tr>
          <td>
            <p style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Order</p>
            <p style="color:${BRAND.colors.accent};font-size:18px;font-weight:600;margin:0;letter-spacing:2px;">${data.orderId}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${trackingSection}

  <!-- PROGRESS BAR -->
  <tr>
    <td style="padding:32px 48px;" class="mobile-padding">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td colspan="4" style="padding-bottom:16px;">
            <div style="height:2px;background:${BRAND.colors.border};position:relative;">
              <div style="height:2px;background:${BRAND.colors.accent};width:${Math.round(((currentStep) / 3) * 100)}%;"></div>
            </div>
          </td>
        </tr>
        <tr>${progressHtml}</tr>
      </table>
    </td>
  </tr>

  ${data.status === 'delivered' ? `
  <tr>
    <td style="padding:0 48px 16px;text-align:center;" class="mobile-padding">
      <p style="color:${BRAND.colors.muted};font-size:13px;line-height:1.6;margin:0;">
        We'd love to hear about your experience. Share your look with <strong style="color:${BRAND.colors.accent};">#WEARITION</strong> on Instagram.
      </p>
    </td>
  </tr>` : ''}

  <tr>
    <td style="padding:8px 48px 48px;text-align:center;" class="mobile-padding">
      ${ctaButton('Track Your Order', `${BRAND.website}/track-order?id=${data.orderId}`)}
      <p style="color:${BRAND.colors.muted};font-size:11px;margin:16px 0 0;">
        Need help? <a href="https://wa.me/${BRAND.whatsapp}" style="color:${BRAND.colors.accent};">Chat with us on WhatsApp</a>
      </p>
    </td>
  </tr>`;

  return {
    subject: `${config.subject} | ${BRAND.name}`,
    html: emailWrapper(content, config.preheader)
  };
}
