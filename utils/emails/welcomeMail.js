// Import the necessary modules here

import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (user) => {
    // Write your code here
    // Create an email transporter
    // SMTP(Simple Mail Transfer Protocol)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'dollyaggarwal1712@gmail.com',
            pass: 'irxd zagn dtur lpkh'
        },
    });
    
    // Configure email content
    const mailOptions = {
        from: 'dollyaggarwal1712@gmail.com',
        to: 'garg07825@gmail.com',
        // Use the html property for HTML content
        html: `
        <div style="text-align: center;">
        <img src="cid:logo" style="height:60px; width:60px;" alt="Storefleet Logo">
        <h1>Welcome to Storefleet</h1>
            <h3>Hello,${user.name}</h3>
            <p>Thank you for registering with Storefleet. We're excited to have you as a new member of our community.</p>
            <button style="padding:5px; margin:5px; color:white; border:none;background-color:#006CA5; border-radius:3px;">Get Started</button>
            </div>
        `,
        // Attachments for logo
        attachments: [
            {
                filename: 'logo.png',
                path: '.././backend/logo.png', // Provide the correct path to your logo
                cid: 'logo' // Use this cid value in the img src attribute
            }
        ]
    };

    // Send the email
    try {
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (err) {
        console.log('Email send failed with error:' + err);
    }
};
