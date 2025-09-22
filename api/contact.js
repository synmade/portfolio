import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, email, message, recaptchaToken } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!recaptchaToken) {
      return res.status(400).json({ message: "Please complete the reCAPTCHA" });
    }

    // Verify reCAPTCHA with Google
    const secret = process.env.RECAPTCHA_SECRET; // Your secret key from Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`;

    const captchaResponse = await fetch(verifyUrl, { method: "POST" });
    const captchaData = await captchaResponse.json();

    if (!captchaData.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Configure Nodemailer with Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options (HTML + fallback text)
    const mailOptions = {
      from: process.env.EMAIL_USER, // your Gmail
      replyTo: email,               // sender's email
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2>New Message from ${name}</h2>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Message sent successfully!" });

  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
