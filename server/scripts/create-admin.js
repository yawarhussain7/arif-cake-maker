// One-off helper: create (or promote) an admin account.
//   node scripts/create-admin.js you@bakery.com "StrongPass123" "Your Name"
// Safe to run repeatedly — an existing account is promoted to admin in place.
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../models/user.models.js'

dotenv.config()

const [email, password, username = 'Admin'] = process.argv.slice(2)

if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [username]')
    process.exit(1)
}

try {
    await mongoose.connect(process.env.MONGO_URI)

    const normalizedEmail = email.trim().toLowerCase()
    const hash = await bcrypt.hash(password, 10)

    const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
            $set: {
                username,
                email: normalizedEmail,
                password: hash,
                role: 'admin',
                isActive: true,
            },
            $setOnInsert: {},
        },
        { upsert: true, new: true, runValidators: true }
    )

    console.log(`Admin ready: ${user.email} (${user.role})`)
    process.exit(0)
} catch (error) {
    console.error('Failed to create admin:', error.message)
    process.exit(1)
}
