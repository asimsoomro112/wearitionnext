/**
 * WEARITION — Ultimate Luxury Email Templates
 * Professional, structured, and visually stunning templates for every stage.
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
    dark: '#0A0A0A',
    light: '#ffffff',
    accent: '#D4AF37', // Premium Gold
    border: '#1a1a1a',
    muted: '#666666'
  }
};

// ──────────────── SHARED WRAPPER ────────────────

function emailWrapper(content: string, theme: 'light' | 'dark' = 'light', preheader: string = ''): string {
  const bgColor = theme === 'dark' ? BRAND.colors.dark : BRAND.colors.light;
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const cardBg = theme === 'dark' ? '#0f0f0f' : '#ffffff';
  const borderColor = theme === 'dark' ? '#1a1a1a' : '#eeeeee';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Inter', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: ${cardBg}; }
    h1, h2, h3 { font-family: 'Cormorant Garamond', serif; font-weight: 400; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .padding-mobile { padding: 40px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${bgColor};">
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${bgColor};padding:20px 0;">
    <tr>
      <td align="center">
        <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="border:1px solid ${borderColor};">
          
          <!-- HEADER -->
          <tr>
            <td style="padding:60px 40px 40px;text-align:center;">
              <a href="${BRAND.website}">
                <img src="${BRAND.logo}" alt="${BRAND.name}" width="200" style="width:200px;height:auto;" />
              </a>
              <p style="color:${BRAND.colors.accent};font-size:9px;letter-spacing:4px;text-transform:uppercase;margin:16px 0 0;">${BRAND.tagline}</p>
            </td>
          </tr>

          ${content}
          
          <!-- FOOTER -->
          <tr>
            <td style="padding:60px 40px;background-color:${theme === 'dark' ? '#000000' : '#fcfcfc'};text-align:center;border-top:1px solid ${borderColor};">
              <p style="color:${BRAND.colors.muted};font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px;">The Maison Wearition</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="padding:0 12px;"><a href="${BRAND.instagram}" style="color:${textColor};font-size:10px;text-decoration:none;">Instagram</a></td>
                  <td style="padding:0 12px;"><a href="${BRAND.facebook}" style="color:${textColor};font-size:10px;text-decoration:none;">Facebook</a></td>
                  <td style="padding:0 12px;"><a href="${BRAND.tiktok}" style="color:${textColor};font-size:10px;text-decoration:none;">TikTok</a></td>
                </tr>
              </table>
              <p style="color:${BRAND.colors.muted};font-size:10px;line-height:1.6;">
                &copy; 2026 ${BRAND.name}. All Rights Reserved.<br/>
                Modern Luxury Essentials. Crafted for the Discerning.
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

// ──────────────── COMPONENTS ────────────────

function statusTracker(currentStage: 'placed' | 'confirmed' | 'shipped' | 'delivered'): string {
  const stages = ['placed', 'confirmed', 'shipped', 'delivered'];
  const currentIndex = stages.indexOf(currentStage);
  
  return `
  <tr>
    <td style="padding:20px 40px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${stages.map((stage, i) => {
            const isActive = i <= currentIndex;
            const color = isActive ? BRAND.colors.accent : '#dddddd';
            return `
            <td style="text-align:center;width:25%;">
              <div style="height:2px;background:${color};margin-bottom:12px;position:relative;">
                <div style="width:10px;height:10px;background:${color};border-radius:50%;position:absolute;top:-4px;left:50%;margin-left:-5px;"></div>
              </div>
              <p style="font-size:9px;color:${isActive ? '#000000' : '#999999'};font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0;">${stage}</p>
            </td>`;
          }).join('')}
        </tr>
      </table>
    </td>
  </tr>`;
}

// ──────────────── TEMPLATES ────────────────

/**
 * 1. Dark Theme Welcome Email
 */
export function welcomeEmail(data: { name: string; email: string }): { subject: string; html: string } {
  const content = `
  <tr>
    <td style="padding:0;text-align:center;">
      <img src="https://images.unsplash.com/photo-1441996675218-5732df2550b5?q=80&w=2070&auto=format&fit=crop" width="100%" style="width:100%;height:auto;display:block;" />
    </td>
  </tr>
  <tr>
    <td style="padding:60px 40px;text-align:center;">
      <p style="color:${BRAND.colors.accent};font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">Welcome to the Inner Circle</p>
      <h2 style="color:#ffffff;font-size:42px;margin:0 0 24px;line-height:1;">Hello, ${data.name}</h2>
      
      <p style="color:#bbbbbb;font-size:15px;line-height:1.8;margin-bottom:40px;">
        You have successfully joined the Maison Wearition. You now have exclusive access to our private collections, bespoke offerings, and elite drops.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="background:${BRAND.colors.accent};padding:18px 48px;border-radius:2px;">
            <a href="${BRAND.website}/shop" style="color:#000000;text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:3px;">EXPLORE NOW</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

  return {
    subject: `Welcome to the Maison ${BRAND.name}`,
    html: emailWrapper(content, 'dark', `Welcome to ${BRAND.name}, ${data.name}! Your luxury journey begins.`)
  };
}

/**
 * 2. OTP Verification
 */
export function verificationOTPEmail(data: { name: string; code: string }): { subject: string; html: string } {
  const content = `
  <tr>
    <td style="padding:60px 40px;text-align:center;">
      <h2 style="font-size:32px;margin:0 0 16px;">Verify Your Identity</h2>
      <p style="color:#666666;font-size:14px;line-height:1.6;margin-bottom:40px;">To continue with your request, please use the following secure 6-digit code:</p>
      
      <div style="background:#f8f8f8;padding:32px;border:1px solid #eeeeee;border-radius:4px;display:inline-block;min-width:240px;">
        <p style="font-size:40px;font-weight:bold;letter-spacing:12px;margin:0;color:#000000;">${data.code}</p>
      </div>
      
      <p style="color:#999999;font-size:11px;margin-top:40px;">This code is valid for 10 minutes. Do not share it with anyone.</p>
    </td>
  </tr>`;

  return {
    subject: `${data.code} is your code | ${BRAND.name}`,
    html: emailWrapper(content, 'light')
  };
}

/**
 * 3. Structured Order Confirmation
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
      <td style="padding:24px 0;border-bottom:1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="90" style="vertical-align:top;">
              <img src="${item.image}" width="80" style="width:80px;height:auto;border-radius:4px;display:block;" />
            </td>
            <td style="padding-left:20px;vertical-align:top;">
              <p style="margin:0;font-size:14px;font-weight:bold;color:#000000;">${item.title.toUpperCase()}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#888888;">QTY: ${item.quantity} ${item.size ? `· SIZE: ${item.size}` : ''}</p>
            </td>
            <td align="right" style="vertical-align:top;">
              <p style="margin:0;font-size:14px;font-weight:bold;color:#000000;">Rs. ${Math.round(item.price * item.quantity).toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const content = `
  <tr>
    <td style="padding:40px 40px 20px;text-align:center;">
      <h2 style="font-size:36px;margin:0 0 8px;">Order Placed</h2>
      <p style="color:#888888;font-size:12px;letter-spacing:1px;margin:0;">ORDER NUMBER: ${data.orderId}</p>
    </td>
  </tr>

  ${statusTracker('placed')}

  <tr>
    <td style="padding:0 40px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fcfcfc;border:1px solid #eeeeee;padding:32px;">
        <tr>
          <td>
            <h3 style="margin:0 0 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888888;">Order Details</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemsHtml}
            </table>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#666666;">Subtotal</td>
                <td align="right" style="padding:6px 0;font-size:13px;color:#000000;">Rs. ${Math.round(data.subtotal).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#666666;">Shipping Fee</td>
                <td align="right" style="padding:6px 0;font-size:13px;color:#000000;">Rs. ${Math.round(data.shipping).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#666666;">Government Tax (4%)</td>
                <td align="right" style="padding:6px 0;font-size:13px;color:#000000;">Rs. ${Math.round(data.tax).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:16px 0 0;font-size:16px;font-weight:bold;color:#000000;border-top:1px solid #eeeeee;margin-top:12px;">Order Total</td>
                <td align="right" style="padding:16px 0 0;font-size:20px;font-weight:bold;color:${BRAND.colors.accent};border-top:1px solid #eeeeee;margin-top:12px;">Rs. ${Math.round(data.total).toLocaleString()}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 40px 48px;">
      <h3 style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888888;">Delivery Address</h3>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#333333;">
        <strong>${data.shippingAddress.name}</strong><br/>
        ${data.shippingAddress.address}<br/>
        ${data.shippingAddress.city}
      </p>
      
      <div style="text-align:center;margin-top:48px;">
        <a href="${BRAND.website}/track-order?id=${data.orderId}" style="background:#000000;color:#ffffff;padding:18px 40px;text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:3px;display:inline-block;">TRACK ORDER</a>
      </div>
    </td>
  </tr>`;

  return {
    subject: `Order Confirmed: ${data.orderId} | ${BRAND.name}`,
    html: emailWrapper(content, 'light')
  };
}

/**
 * 4. Structured Order Status Update
 */
export function orderStatusEmail(data: {
  name: string;
  orderId: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
}): { subject: string; html: string } {
  
  const statusMap: any = {
    processing: 'confirmed',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'placed' // we keep the dots but it's cancelled
  };

  const currentStage = statusMap[data.status];

  const content = `
  <tr>
    <td style="padding:40px 40px 20px;text-align:center;">
      <h2 style="font-size:36px;margin:0 0 8px;">Order Update</h2>
      <p style="color:#888888;font-size:12px;letter-spacing:1px;margin:0;">ORDER NUMBER: ${data.orderId}</p>
    </td>
  </tr>

  ${statusTracker(currentStage)}

  <tr>
    <td style="padding:0 40px 40px;">
      <div style="background:#fcfcfc;border:1px solid #eeeeee;padding:32px;text-align:center;">
        <p style="color:${BRAND.colors.accent};font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;margin:0 0 12px;">Current Status</p>
        <h3 style="font-size:24px;margin:0 0 16px;color:#000000;">${data.status.toUpperCase()}</h3>
        
        ${data.status === 'shipped' && data.trackingNumber ? `
          <div style="border-top:1px solid #eeeeee;margin-top:24px;padding-top:24px;">
            <p style="font-size:10px;color:#888888;letter-spacing:2px;margin:0 0 8px;">TRACKING NUMBER</p>
            <p style="font-size:20px;font-weight:bold;color:#000000;letter-spacing:4px;">${data.trackingNumber}</p>
            <p style="font-size:11px;color:#999999;margin:8px 0 0;">Courier: ${data.courierName || 'Leopards Courier'}</p>
          </div>
        ` : ''}

        <p style="font-size:14px;color:#555555;line-height:1.8;margin-top:24px;">
          ${data.status === 'processing' ? 'Your order has been confirmed and our artisans are preparing your selection for shipment.' :
            data.status === 'shipped' ? 'Your package has left our Maison and is currently en route to your delivery address.' :
            data.status === 'delivered' ? 'Your Wearition package has been successfully delivered. We hope you love your new pieces.' :
            'Your order has been cancelled and any payments made will be processed as per policy.'}
        </p>
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:0 40px 48px;text-align:center;">
      <a href="${BRAND.website}/track-order?id=${data.orderId}" style="background:#000000;color:#ffffff;padding:18px 40px;text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:3px;display:inline-block;">VIEW ORDER STATUS</a>
    </td>
  </tr>`;

  return {
    subject: `Order ${data.status.toUpperCase()}: ${data.orderId} | ${BRAND.name}`,
    html: emailWrapper(content, 'light')
  };
}

/**
 * 5. Password Reset OTP
 */
export function passwordResetOTPEmail(data: { name?: string; code: string }): { subject: string; html: string } {
  const content = `
  <tr>
    <td style="padding:60px 40px;text-align:center;">
      <h2 style="font-size:32px;margin:0 0 16px;">Reset Password</h2>
      <p style="color:#666666;font-size:14px;line-height:1.6;margin-bottom:40px;">Please use the code below to securely reset your password.</p>
      
      <div style="background:#000000;padding:32px;border-radius:4px;display:inline-block;min-width:240px;">
        <p style="font-size:40px;font-weight:bold;letter-spacing:12px;margin:0;color:${BRAND.colors.accent};">${data.code}</p>
      </div>
      
      <p style="color:#999999;font-size:11px;margin-top:40px;">This security code expires in 10 minutes.</p>
    </td>
  </tr>`;

  return {
    subject: `Password Reset Code: ${data.code} | ${BRAND.name}`,
    html: emailWrapper(content, 'light')
  };
}
