import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
dotenv.config()


const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS
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

function getVerificationCodeTemplate(code, nameOrUsername, reasonToUseCode = "Please use this code and verify your new email</b>", fromBrandName = 'Our Company Name', extraHTML = '') {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${linkTitle}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
    
            h1 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
                text-align: center;
            }
    
            p {
                font-size: 16px;
                color: #333333;
                margin-bottom: 20px;
            }
    
            .code {
                font-size: 36px;
                font-weight: bold;
                color: #007bff;
            }
    
            .footer {
                font-size: 14px;
                color: #666666;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Verification Code</h1>
            <h2>Hello, ${nameOrUsername}</h2>
            <p>Your verification code is: <span class="code">${code}</span></p>
            <p>${reasonToUseCode}</p>
            ${extraHTML}
            <p>Thank you, <br>${fromBrandName}</p>
        </div>
    </body>
    </html>
    
    `
}
function getVerificationLinkTemplate(link, linkTitle, nameOrUsername, fromBrandName = 'Our Company Name') {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${linkTitle}</title>
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
            <h2>${linkTitle}</h2>
            <p>Hello, ${nameOrUsername}</p>
            <p>We received a request to reset your password. Click the link below to reset it:</p>
            <p><a class="reset-link" href="${link}">Reset Password</a></p>
            <p><b>If you didn't request any password reset, please ignore this email.</b></p>
            <p>Thank you, <br>${fromBrandName}</p>
        </div>
    </body>
    </html>`
}
function getEmailConfirmationTemplate(link, linkTitle, nameOrUsername, reasonToUseLink = "You just tried to create an account, please click the link to verify", fromBrandName = 'Our Company Name', ifUserDidNot = "<p>If you did not requested for this email confirmation, <b>then please ignore this email</b></p>", extraHTML = '') {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${linkTitle}</title>
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
            .link {
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
            <h2>${linkTitle}</h2>
            <p>Hello, ${nameOrUsername}</p>
            <p>${reasonToUseLink}</p>
            <p><a class="link" href="${link}">${linkTitle}</a></p>
            ${ifUserDidNot}
            ${extraHTML}
            <p>Thank you, <br>${fromBrandName}</p>
        </div>
    </body>
    </html>`
}



export { sendMail, getVerificationCodeTemplate, getVerificationLinkTemplate, getEmailConfirmationTemplate }


export default transporter