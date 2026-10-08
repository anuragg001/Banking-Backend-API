require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

//verify the connection configuration

transporter
  .verify()
  .then(() => console.log("Email server is ready to send email"))
  .catch((error) => console.error("Error connecting to email server:", error));


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegisterationEmail(userEmail, name) {
  const subject = 'Welcome to Backend Ledger'
  const text = `Hello ${name},\n\nThank you for registering with Backend Ledger! We're excited to have you on board.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering with Backend Ledger! We're excited to have you on board.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}


async function sendTransactionEmail(userEmail, name, transactionDetails) {
  const subject = 'Transaction Notification'
  const text = `Hello ${name},\n\nA transaction has been made on your account:\n\n${transactionDetails}\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>A transaction has been made on your account:</p><p>${transactionDetails}</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFail(userEmail, name, transactionDetails) {
  const subject = 'Transaction Failed Notification'
  const text = `Hello ${name},\n\nA transaction has failed on your account:\n\n${transactionDetails}\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>A transaction has failed on your account:</p><p>${transactionDetails}</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}


module.exports = {
  transporter,
  sendEmail,
  sendRegisterationEmail,
  sendTransactionEmail,
  sendTransactionFail
};
