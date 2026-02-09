import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual authentication
    console.log('Login attempt:', { email, password })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-mnflix_light_blue mb-2">MNFLIX</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-8">
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-mnflix_light_blue"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-mnflix_light_blue"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-mnflix_light_blue text-white py-3 rounded-md hover:bg-opacity-90 transition font-semibold mb-4"
          >
            Sign In
          </button>

          <div className="text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-mnflix_light_blue hover:underline">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
