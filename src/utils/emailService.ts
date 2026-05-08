export const sendEmailNotification = (toEmail: string, type: 'confirmation' | 'processing' | 'shipped' | 'delivered', data: any) => {
  // In a real application, you would connect to a provider like EmailJS or Resend here.
  // For EmailJS: emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY');
  
  const subjects = {
    confirmation: 'Order Confirmation - Wearition',
    processing: 'Your Order is Being Processed',
    shipped: 'Your Order is on the Way!',
    delivered: 'Your Order has been Delivered'
  };

  const templateParams = {
    to_email: toEmail,
    subject: subjects[type],
    order_id: data.orderId,
    tracking_link: `https://your-domain.com/track?id=${data.orderId}`,
    message: `Hello! This is a notification about your order ${data.orderId}. Status: ${type.toUpperCase()}`
  };

  console.log(`[Email Service Mock] Sending email to ${toEmail}`);
  console.log(`[Email Service Mock] Subject: ${templateParams.subject}`);
  console.log(`[Email Service Mock] Body: ${templateParams.message}`);
  
  return Promise.resolve(templateParams);
};
