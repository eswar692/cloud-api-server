const nodemailer = require('nodemailer');
require('dotenv').config();

// Function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTP(email, mailOptions, otp) {
  // Configure the transporter
  const transporter = nodemailer.createTransport({
    host: process.env.host,
    port: process.env.emailPort,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.pass
    }
  });

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(` sent to ${email}`);
    return otp ? otp : null;
  } catch (error) {
    console.error('Error sending Email:', error);
    throw error;
  }
}

// function mailOptions({ title, email, message, otp }) {
//   // title anedi untundi all
//   return {
//     from: 'info@prodaddyagency.com',
//     to: email,
//     subject: `${title}`,
//     html: `
//             <div>
//                 <h1 style="color: #4CAF50;">${title}</h1>
//                 <p style="font-size: 18px;">${message.text}</p>
//                 <h2 style="font-size: 24px; color: #FF5722;">${
//                   otp || message.main
//                 }</h2>
//                 <p style="font-size: 16px;">${
//                   otp ? 'This OTP is valid for 5 minutes.' : message.sub
//                 }.</p>
//                 <p style="font-size: 14px; color: #888;">If you did not request this, please ignore this email.</p>
//                 <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">
//                     &copy; ${new Date().getFullYear()} Pro Daddy Agency . All rights reserved.
//                 </footer>
//                 <p style="font-size: 12px; color: #aaa;">This is an automated message, please do not reply.</p>
//             </div>
//         `
//   };
// }

function mailOptions({ title, email, message, otp }) {
  return {
    from: process.env.email,
    to: email,
    subject: `${title}`,
    html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; border: 1px solid #ddd; border-radius: 10px; padding: 32px; background-color: #ffffff;">
        
        <header style="text-align: center; margin-bottom: 32px;">
          <h2 style="color: #222; font-size: 24px;">${title}</h2>
        </header>

        <main>
          <p style="font-size: 16px; color: #444; line-height: 1.6;">
            ${
              message.text ||
              'Dear user, please verify your email with the OTP below.'
            }
          </p>

          <div style="margin: 32px 0; text-align: center;">
            <div style="font-size: 28px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 4px; border: 2px dashed #FF5722; color: #FF5722; background-color: #f9f9f9; padding: 14px 28px; display: inline-block; border-radius: 10px;">
              ${otp}
            </div>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            ${otp ? 'This OTP is valid for 10 minutes.' : message.sub || ''}
          </p>
          <p style="font-size: 14px; color: #999;">If you did not request this email, you can safely ignore it.</p>
        </main>

        <footer style="margin-top: 48px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
          &copy; ${new Date().getFullYear()} Pro Daddy Agency. All rights reserved.<br/>
          This is an automated message. Please do not reply.
        </footer>

      </div>
    `
  };
}

module.exports = { sendOTP, generateOTP, mailOptions };
