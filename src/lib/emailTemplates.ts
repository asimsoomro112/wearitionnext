/**
 * WEARITION — Ultimate Luxury Email Templates
 * Refined, high-contrast, and minimalist design for elite customer experience.
 */

const BRAND = {
  name: 'WEARITION',
  tagline: 'Modern Luxury. Timeless Craft.',
  logo: 'https://wearition.store/logo.png', 
  website: 'https://wearition.store',
  instagram: 'https://www.instagram.com/_wearition?igsh=eG5obHgydGc3a2Vr',
  facebook: 'https://www.facebook.com/profile.php?id=61589494648557',
  tiktok: 'https://www.tiktok.com/@wearition3?_r=1&_t=ZS-96Byntwejln',
  whatsapp: '923000000000', 
  supportEmail: 'wearition.80@gmail.com',
  colors: {
    bg: '#ffffff',
    card: '#ffffff',
    accent: '#D4AF37', // Premium Gold
    text: '#000000',
    muted: '#888888',
    white: '#FFFFFF',
    border: '#f0f0f0',
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
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');
    
    body { margin: 0; padding: 0; background-color: #f8f8f8; font-family: 'Inter', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #eeeeee; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
    h1, h2, h3 { font-family: 'Cormorant Garamond', 'Times New Roman', serif; font-weight: 400; letter-spacing: 1px; }
    .otp-box { background: #000000; color: #D4AF37; font-size: 32px; letter-spacing: 8px; font-weight: bold; padding: 24px; text-align: center; border-radius: 4px; margin: 32px 0; font-family: 'Inter', monospace; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: 0 !important; }
      .padding-mobile { padding: 40px 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;">
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;padding:20px;">
    <tr>
      <td align="center">
        <table class="email-container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="padding:60px 40px 40px;text-align:center;">
              <a href="${BRAND.website}" style="text-decoration:none;">
                <img src="${BRAND.logo}" alt="${BRAND.name}" width="200" style="max-width:200px;height:auto;display:block;margin:0 auto;" />
                <p style="color:#D4AF37;font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:16px 0 0;">${BRAND.tagline}</p>
              </a>
            </td>
          </tr>

          ${content}
          
          <!-- FOOTER -->
          <tr>
            <td style="padding:60px 40px;background-color:#000000;text-align:center;">
              <p style="color:#D4AF37;font-size:9px;letter-spacing:4px;text-transform:uppercase;margin:0 0 24px;">Connect with the Maison</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="padding:0 12px;"><a href="${BRAND.instagram}" style="color:#ffffff;font-size:10px;text-decoration:none;letter-spacing:1px;">INSTAGRAM</a></td>
                  <td style="padding:0 12px;"><a href="${BRAND.facebook}" style="color:#ffffff;font-size:10px;text-decoration:none;letter-spacing:1px;">FACEBOOK</a></td>
                  <td style="padding:0 12px;"><a href="${BRAND.tiktok}" style="color:#ffffff;font-size:10px;text-decoration:none;letter-spacing:1px;">TIKTOK</a></td>
                </tr>
              </table>
              <p style="color:#555555;font-size:10px;line-height:1.8;">
                &copy; ${new Date().getFullYear()} ${BRAND.name} LUXURY RETAIL GROUP.<br/>
                This is a private notification for verified members only.
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

// ──────────────── TEMPLATES ────────────────

/**
 * OTP Verification Template
 */
export function verificationOTPEmail(data: { name: string; code: string }): { subject: string; html: string } {
  const content = `
  <tr>
    <td style="padding:40px 60px;" class="padding-mobile">
      <h2 style="color:#000000;font-size:36px;margin:0 0 24px;text-align:center;">Verify Your Account</h2>
      <p style="color:#555555;font-size:14px;line-height:1.8;text-align:center;margin-bottom:32px;">
        Welcome to the inner circle of WEARITION. To complete your registration and unlock exclusive access, please use the following verification code:
      </p>
      
      <div class="otp-box">${data.code}</div>
      
      <p style="color:#999999;font-size:11px;text-align:center;margin-top:32px;">
        This code is valid for 10 minutes. If you did not request this, please ignore this email.
      </p>
    </td>
  </tr>`;

  return {
    subject: `${data.code} is your verification code | ${BRAND.name}`,
    html: emailWrapper(content, `Verify your WEARITION account with code ${data.code}`)
  };
}

/**
 * Password Reset OTP Template
 */
export function passwordResetOTPEmail(data: { name?: string; code: string }): { subject: string; html: string } {
  const content = `
  <tr>
    <td style="padding:40px 60px;" class="padding-mobile">
      <h2 style="color:#000000;font-size:36px;margin:0 0 24px;text-align:center;">Reset Password</h2>
      <p style="color:#555555;font-size:14px;line-height:1.8;text-align:center;margin-bottom:32px;">
        A password reset request was made for your account. Please use the following code to securely reset your credentials:
      </p>
      
      <div class="otp-box">${data.code}</div>
      
      <p style="color:#999999;font-size:11px;text-align:center;margin-top:32px;">
        For security reasons, this code will expire in 10 minutes. 
      </p>
    </td>
  </tr>`;

  return {
    subject: `${data.code} is your password reset code | ${BRAND.name}`,
    html: emailWrapper(content, `Reset your password with code ${data.code}`)
  };
}

/**
 * Welcome Email (Upgraded)
 */
export function welcomeEmail(data: { name: string; email: string }): { subject: string; html: string } {
  const content = `
  <tr>
    <td style="padding:0 0 40px;text-align:center;">
      <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" width="100%" style="width:100%;height:auto;" />
    </td>
  </tr>
  <tr>
    <td style="padding:40px 60px;" class="padding-mobile">
      <h2 style="color:#000000;font-size:40px;margin:0 0 16px;text-align:center;">Welcome to the Maison</h2>
      <p style="color:#D4AF37;font-size:11px;letter-spacing:4px;text-transform:uppercase;text-align:center;margin-bottom:32px;font-weight:600;">The Journey Begins</p>
      
      <p style="color:#555555;font-size:14px;line-height:2;text-align:center;">
        Hello ${data.name},<br/><br/>
        We are honored to welcome you to WEARITION. You now have access to a world of modern luxury and unparalleled craftsmanship. Your account is fully verified and ready for your first selection.
      </p>

      <div style="text-align:center;margin:48px 0;">
        <a href="${BRAND.website}/shop" style="background:#000000;color:#ffffff;padding:18px 40px;text-decoration:none;font-size:11px;letter-spacing:4px;font-weight:bold;border-radius:2px;">EXPLORE COLLECTIONS</a>
      </div>
    </td>
  </tr>`;

  return {
    subject: `Welcome to the Maison ${BRAND.name}`,
    html: emailWrapper(content, `Welcome to WEARITION. Your journey into luxury fashion begins here.`)
  };
}

/**
 * Order Confirmation (Upgraded)
 */
export function orderPlacedEmail(data: {
  name: string;
  orderId: string;
  items: { title: string; quantity: number; price: number; size?: string; color?: string; image?: string }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: { name: string; address: string; city: string };
}): { subject: string; html: string } {

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:24px 0;border-bottom:1px solid #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80"><img src="${item.image}" width="80" style="width:80px;height:auto;border-radius:2px;" /></td>
            <td style="padding-left:20px;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#000000;">${item.title.toUpperCase()}</p>
              <p style="margin:6px 0 0;font-size:11px;color:#888888;letter-spacing:1px;">QTY: ${item.quantity} ${item.size ? `· SIZE ${item.size}` : ''}</p>
            </td>
            <td align="right">
              <p style="margin:0;font-size:13px;font-weight:600;color:#000000;">Rs. ${Math.round(item.price * item.quantity).toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const content = `
  <tr>
    <td style="padding:40px 60px;" class="padding-mobile">
      <p style="color:#D4AF37;font-size:10px;letter-spacing:4px;text-transform:uppercase;text-align:center;margin-bottom:12px;font-weight:600;">Confirmation</p>
      <h2 style="color:#000000;font-size:36px;margin:0 0 32px;text-align:center;">Your order is being prepared</h2>
      
      <div style="background:#fcfcfc;padding:24px;border:1px solid #f0f0f0;margin-bottom:40px;text-align:center;">
        <p style="margin:0 0 4px;font-size:10px;color:#888888;letter-spacing:2px;">ORDER NUMBER</p>
        <p style="margin:0;font-size:24px;font-weight:300;color:#000000;letter-spacing:4px;">${data.orderId}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemsHtml}
        <tr>
          <td colspan="3" style="padding-top:32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:#888888;padding-bottom:8px;">Subtotal</td>
                <td align="right" style="font-size:12px;color:#000000;padding-bottom:8px;">Rs. ${Math.round(data.subtotal).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#888888;padding-bottom:8px;">Shipping</td>
                <td align="right" style="font-size:12px;color:#000000;padding-bottom:8px;">Rs. ${Math.round(data.shipping).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#888888;padding-bottom:16px;">Tax</td>
                <td align="right" style="font-size:12px;color:#000000;padding-bottom:16px;">Rs. ${Math.round(data.tax).toLocaleString()}</td>
              </tr>
              <tr style="border-top:1px solid #000000;">
                <td style="font-size:14px;font-weight:bold;color:#000000;padding-top:16px;">Total</td>
                <td align="right" style="font-size:18px;font-weight:bold;color:#D4AF37;padding-top:16px;">Rs. ${Math.round(data.total).toLocaleString()}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

  return {
    subject: `Confirmed: Order ${data.orderId} | ${BRAND.name}`,
    html: emailWrapper(content, `Your order ${data.orderId} from ${BRAND.name} has been confirmed.`)
  };
}

/**
 * Order Status Update
 */
export function orderStatusEmail(data: {
  name: string;
  orderId: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
}): { subject: string; html: string } {
  
  const statusLabels = {
    processing: 'PREPARING',
    shipped: 'EN ROUTE',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED'
  };

  const content = `
  <tr>
    <td style="padding:40px 60px;" class="padding-mobile">
      <p style="color:#D4AF37;font-size:10px;letter-spacing:4px;text-transform:uppercase;text-align:center;margin-bottom:12px;font-weight:600;">Status Update</p>
      <h2 style="color:#000000;font-size:36px;margin:0 0 8px;text-align:center;">Your order is ${statusLabels[data.status]}</h2>
      <p style="color:#888888;font-size:12px;text-align:center;margin-bottom:40px;letter-spacing:1px;">ORDER ${data.orderId}</p>
      
      ${data.status === 'shipped' && data.trackingNumber ? `
      <div style="background:#000000;padding:32px;text-align:center;margin-bottom:32px;">
        <p style="color:#D4AF37;font-size:10px;letter-spacing:2px;margin:0 0 12px;">TRACKING NUMBER</p>
        <p style="color:#ffffff;font-size:24px;font-weight:bold;margin:0;letter-spacing:4px;">${data.trackingNumber}</p>
        <p style="color:#888888;font-size:11px;margin:12px 0 0;">Courier: ${data.courierName || 'Global Express'}</p>
      </div>
      ` : ''}

      <p style="color:#555555;font-size:14px;line-height:1.8;text-align:center;">
        ${data.status === 'processing' ? 'Our artisans are carefully preparing your items for dispatch.' : 
          data.status === 'shipped' ? 'Your package has been dispatched and is currently on its way to you.' :
          data.status === 'delivered' ? 'Your WEARITION package has been delivered. We hope you enjoy your selection.' :
          'Your order has been cancelled as per your request or due to unforeseen circumstances.'}
      </p>

      <div style="text-align:center;margin-top:48px;">
        <a href="${BRAND.website}/track-order?id=${data.orderId}" style="border:1px solid #000000;padding:16px 32px;color:#000000;text-decoration:none;font-size:10px;letter-spacing:3px;font-weight:bold;">VIEW DETAILS</a>
      </div>
    </td>
  </tr>`;

  return {
    subject: `Update on Order ${data.orderId} | ${BRAND.name}`,
    html: emailWrapper(content, `Your order status has been updated to ${data.status}.`)
  };
}
