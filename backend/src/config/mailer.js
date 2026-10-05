const nodemailer = require('nodemailer')
let t = null
const tr = () => { if (!t) t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587, secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }); return t }
const sendMail = ({ to, subject, html, text }) => tr().sendMail({ from: process.env.EMAIL_FROM || '"BEAUTIQ" <noreply@beautiq.in>', to, subject, html, text })
const otpHtml = (name, otp, p) => `<div style="font-family:sans-serif;max-width:480px;margin:auto"><h2>BEAUTIQ</h2><p>Hi ${name||'there'},</p><p>${p==='reset'?'Use this code to reset your password.':'Please verify your email.'}</p><div style="background:#F3ECE2;text-align:center;padding:24px;margin:24px 0;letter-spacing:12px;font-size:36px;font-weight:bold">${otp}</div><p style="color:#666;font-size:13px">Expires in 10 minutes. If you didn't request this, ignore it.</p></div>`
const otpEmail = (name, otp, purpose) => ({ subject: purpose==='reset'?'BEAUTIQ – Reset your password':'BEAUTIQ – Verify your email', html: otpHtml(name, otp, purpose), text: `Your BEAUTIQ code: ${otp}\nExpires in 10 minutes.` })
module.exports = { sendMail, otpEmail }
