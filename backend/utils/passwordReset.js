import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
 import dotenv from "dotenv";
 dotenv.config();



const generateResetToken = (user) => {
  const tokenObject = {
    email: user.email,
    id: user._id,
  };
  const resetToken = jwt.sign(tokenObject, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return resetToken;
};

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendResetPasswordEmail = async (email, resetToken) => {
  const resetLink = `${process.env.RESET_LINK}?token=${resetToken}`;  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `${process.env.SMTP_BRAND} - Restablecimiento de contraseña`,
    text: `Haga clic en este enlace para restablecer su contraseña: ${resetLink}  
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Enlace de restablecimiento de contraseña enviado a ${email}`);
  } catch (error) {
    console.error(`Error al enviar email a ${email}:`, error.message);
    throw new Error("Error al enviar el correo electrónico");
  }
};

export { generateResetToken, sendResetPasswordEmail };
    
