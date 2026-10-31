import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CakeSlice, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { adminJson } from '../adminApi'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const signIn = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await adminJson('/admin/login', 'POST', { email: email.trim(), password })
      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><span><CakeSlice size={31} /></span><div><strong>Sweet Bites</strong><small>ADMINISTRATION</small></div></div>
        <h1>Welcome back</h1>
        <p>Sign in to manage your bakery.</p>
        <form onSubmit={signIn}>
          <label><span>Email address</span><i><Mail size={17} /><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="admin@example.com" /></i></label>
          <label><span>Password</span><i><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></i></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to dashboard'}</button>
        </form>
        <small className="login-secure">Authorized Sweet Bites staff only</small>
      </section>
    </main>
  )
}
