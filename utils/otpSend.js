const nodemailer = require("nodemailer");

// Function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTP(email) {
  const otp = generateOTP();

  // Configure the transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "digitallogic469@gmail.com",
      pass: "pblfdomvantedzwt",
    },
  });

  // Email options
  const mailOptions = {
    from: "digitallogic469@gmail.com",
    to: email,
    subject: "Your OTP Code",
    html: `
            <div>
                <h1 style="color: #4CAF50;">Your OTP Code</h1>
                <p style="font-size: 18px;">Use the following OTP to verify your email:</p>
                <h2 style="font-size: 24px; color: #FF5722;">${otp}</h2>
                <p style="font-size: 16px;">This OTP is valid for 5 minutes.</p>
                <p style="font-size: 14px; color: #888;">If you did not request this, please ignore this email.</p>
                <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">
                    &copy; ${new Date().getFullYear()} Pro Daddy Agency . All rights reserved.
                </footer>
                <p style="font-size: 12px; color: #aaa;">This is an automated message, please do not reply.</p>
            </div>
        `,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    return otp;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

module.exports = { sendOTP };
