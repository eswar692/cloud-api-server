const nodemailer = require("nodemailer");

// Function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTP(email,mailOptions,otp) {

  // Configure the transporter
  const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", 
  port: 465,                 
  secure: true,               
  auth: {
    user: "info@prodaddyagency.com", 
    pass: "Prodaddyagency@888",      
  },
});



  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(` sent to ${email}`);
    return otp ? otp : null;
  } catch (error) {
    console.error("Error sending Email:", error);
    throw error;
  }
}





function mailOptions ({title,email,message,otp}){
  return{
    from: "info@prodaddyagency.com",
    to: email,
    subject:`${title}`,
    html: `
            <div>
                <h1 style="color: #4CAF50;">${title }</h1>
                <p style="font-size: 18px;">${message.text}</p>
                <h2 style="font-size: 24px; color: #FF5722;">${otp || message.main}</h2>
                <p style="font-size: 16px;">${otp ? "This OTP is valid for 5 minutes." : message.sub}.</p>
                <p style="font-size: 14px; color: #888;">If you did not request this, please ignore this email.</p>
                <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">
                    &copy; ${new Date().getFullYear()} Pro Daddy Agency . All rights reserved.
                </footer>
                <p style="font-size: 12px; color: #aaa;">This is an automated message, please do not reply.</p>
            </div>
        `,
  }
}

module.exports = { sendOTP,generateOTP,mailOptions };