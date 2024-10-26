const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const secret = process.env.SECRET;

const createResetToken = (user) => {
  const tokenObject = {
    email: user.email,
    id: user._id,
  };
  const expirationTime = 3600;
  const resetToken = jwt.sign(tokenObject, secret, {
    expiresIn: expirationTime,
  });
  return resetToken;
};

const sendInactiveUserEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error al enviar email a ${to}:`, error.message);
  }
};

module.exports = {
  transporter,
  createResetToken,
  sendInactiveUserEmail,
};
