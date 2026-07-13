const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const sendEmail = async ({ to, subject, html }) => {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const messageParts = [
    `From: "Legal Guardian" <${process.env.EMAIL_USER}>`,
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    html,
  ];

  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
};

/**
 * Send email with PDF attachment
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} filename - PDF filename
 */
const sendEmailWithAttachment = async ({ to, subject, html, pdfBuffer, filename }) => {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const boundary = "boundary_" + Math.random().toString(36).substr(2, 9);

  const messageParts = [
    `From: "Legal Guardian" <${process.env.EMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: quoted-printable",
    "",
    html,
    "",
    `--${boundary}`,
    `Content-Type: application/pdf; name="${filename}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${filename}"`,
    "",
    pdfBuffer.toString("base64"),
    "",
    `--${boundary}--`,
  ];

  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
};

// 📩 OTP EMAIL
async function sendOtpEmail(userEmail, userName, otp) {
  const subject = "Your Legal Guardian Verification Code";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;padding:30px;background:#f4f6f8;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;text-align:center;">
      <h2>Hello ${userName}, 👋</h2>
      <p>Use the following OTP to verify your account:</p>
      <h1 style="letter-spacing:4px;color:#4f46e5;">${otp}</h1>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="font-size:12px;color:#777;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  </div>
  `;

  await sendEmail({ to: userEmail, subject, html });
}

// 📩 PASSWORD RESET EMAIL
async function sendPasswordResetEmail(userEmail, userName, otp) {
  const subject = "Reset Your Legal Guardian Password";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;padding:30px;background:#f4f6f8;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;text-align:center;">
      <h2>Hello ${userName}, 👋</h2>
      <p>We received a request to reset your password.</p>
      <p>Use the following OTP to reset your password:</p>
      <h1 style="letter-spacing:4px;color:#4f46e5;">${otp}</h1>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="font-size:12px;color:#777;">
        If you didn't request this, please ignore this email and your password will remain unchanged.
      </p>
    </div>
  </div>
  `;

  await sendEmail({ to: userEmail, subject, html });
}

// 📩 REGISTRATION SUCCESS EMAIL
async function sendRegistrationEmail(userEmail, userName) {
  const subject = "Welcome to Legal Guardian 🚀";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;padding:30px;background:#f4f6f8;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;">
      
      <h1 style="color:#111827;">Welcome to Legal Guardian, ${userName}! 🎉</h1>

      <p style="color:#374151;line-height:1.6;">
        Your account has been successfully created.
      </p>

      <p style="color:#374151;line-height:1.6;">
        Legal Guardian is your AI-powered assistant for analyzing legal documents,
        understanding contracts, and making informed decisions.
      </p>

      <div style="margin:25px 0;padding:20px;background:#eef2ff;border-radius:10px;">
        <p style="margin:0;color:#4338ca;font-weight:600;">
          Start analyzing documents and chat with our AI guardian today 🚀
        </p>
      </div>

      <p style="color:#6b7280;font-size:14px;">
        Happy analyzing,<br/>
        <strong>Team Legal Guardian</strong>
      </p>

    </div>
  </div>
  `;

  await sendEmail({ to: userEmail, subject, html });
}

// 📩 LOGIN ALERT EMAIL
async function sendLoginEmail(userEmail, userName) {
  const loginTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = "New Login to Your Legal Guardian Account";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;padding:30px;background:#f4f6f8;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;">
      
      <h2>Hello ${userName}, 👋</h2>

      <p style="color:#374151;">
        We detected a new login to your Legal Guardian account.
      </p>

      <div style="margin:20px 0;padding:15px;background:#f3f4f6;border-radius:8px;">
        <strong>Login Time:</strong> ${loginTime}
      </div>

      <p style="color:#6b7280;font-size:14px;">
        If this was you, you can safely ignore this email.
      </p>

      <p style="color:#dc2626;font-size:14px;">
        If this wasn't you, please reset your password immediately.
      </p>

      <p style="margin-top:20px;color:#6b7280;font-size:14px;">
        Stay secure,<br/>
        <strong>Team Legal Guardian</strong>
      </p>

    </div>
  </div>
  `;

  await sendEmail({ to: userEmail, subject, html });
}

// 📩 CONTACT PROFESSIONAL EMAIL WITH PDF
async function sendProfessionalContactEmail(professionalEmail, professionalName, userEmail, userName, pdfBuffer, fileName) {
  const subject = "New Client Inquiry via Legal Guardian - Document Attached";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;padding:30px;background:#f4f6f8;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;">
      
      <h2>Hello ${professionalName}, 👋</h2>

      <p style="color:#374151;">
        A user has requested to contact you for professional advice through the Legal Guardian platform.
      </p>

      <div style="margin:20px 0;padding:15px;background:#f3f4f6;border-radius:8px;border-left:4px solid #1B2F4E;">
        <strong style="display:block;margin-bottom:8px;">📋 Client Details:</strong>
        <strong>User Name:</strong> ${userName}<br/>
        <strong>User Email:</strong> ${userEmail}
      </div>

      ${pdfBuffer && fileName ? `
      <div style="margin:20px 0;padding:15px;background:#fffbeb;border-radius:8px;border-left:4px solid #f59e0b;">
        <strong style="color:#b45309;">📄 Document Attached:</strong>
        <p style="margin:8px 0 0 0;color:#92400e;">
          The client's document "<strong>${fileName}</strong>" is attached to this email for your review and analysis.
        </p>
      </div>
      ` : ''}

      <p style="color:#6b7280;font-size:14px;">
        Please review the attached document and reach out to the client directly via the provided email address to assist them.
      </p>

      <p style="margin-top:20px;color:#6b7280;font-size:14px;">
        Best regards,<br/>
        <strong>Team Legal Guardian</strong>
      </p>

    </div>
  </div>
  `;

  // Send with attachment if PDF is provided, otherwise send regular email
  if (pdfBuffer && fileName) {
    await sendEmailWithAttachment({
      to: professionalEmail,
      subject,
      html,
      pdfBuffer,
      filename: fileName,
    });
  } else {
    await sendEmail({ to: professionalEmail, subject, html });
  }
}

module.exports = {
  sendRegistrationEmail,
  sendLoginEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendProfessionalContactEmail,
  sendEmailWithAttachment,
};
