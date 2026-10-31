import path from 'path'
import { fileURLToPath } from 'url'
import { sendMail } from '../utils/sendMail.js';
import { readFile } from 'node:fs/promises'


const currentfile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentfile)

const template = path.join(currentDir,'../template/email.html')

export const sendVerificationEmail = async({to,name,otp})=>{
    let html = await readFile(template, 'utf-8')

    html = html.replaceAll('{{name}}', escapeHtml(name))
        .replaceAll('{{otp}}', escapeHtml(otp));

         return sendMail({
        to,
        subject: 'Verify Your Email - Arif-Cake-Makers',
        html
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}