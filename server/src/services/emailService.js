
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"AI Finance Management" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your AI Finance Management Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">

        <h2 style="text-align: center;">
          AI Finance Management
        </h2>

        <p>Hello,</p>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${resetUrl}"
            style="
              background: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
            "
          >
            Reset Password
          </a>
        </div>

        <p>
          This password reset link will expire in <strong>15 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
        </p>
<p> Regards,<br /> AI Finance Management Team </p> </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

