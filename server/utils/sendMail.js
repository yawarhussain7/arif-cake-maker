import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

// Verify transporter configuration on module load
transport.verify((error, success) => {
    if (error) {
        console.error(' Nodemailer transport verification failed:', error.message)
    } else {
        console.log(' Nodemailer transport is ready to send emails')
    }
})

export const sendMail = async ({ to, subject, html }) => {
    try {
        return await transport.sendMail({
            from: `"Arif-Cake-Makers " <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        })
    } catch (error) {
        console.error(' Failed to send email:', error.message)
        throw error
    }
}