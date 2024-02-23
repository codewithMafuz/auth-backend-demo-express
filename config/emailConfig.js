import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'carol79@ethereal.email',
        pass: 'fwfmx5fAEQ6Ujjw7aJ'
    }
});

async function sendMail(to, subject, html) {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,

        to,
        subject,
        html
    })
    return info
}
const resetPasswordLinkBody = (link, nameOrUsername = "Sir/Mam", linkTitle = 'Reset Password', title = "Password Reset") => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333333;
        }
        p {
            color: #555555;
        }
        .reset-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>${title}</h2>
        <p>Hello ${nameOrUsername}</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a class="reset-link" href="${link}">${linkTitle}</a></p>
        <p><b>If you didn't request any password reset, please ignore this email.</b></p>
        <p>Thank you,<br>Your Company Name</p>
    </div>
</body>
</html>`
}


export { sendMail, resetPasswordLinkBody }


export default transporter