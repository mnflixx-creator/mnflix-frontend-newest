import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-mnflix_light_blue">
            MNFLIX
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-white hover:text-mnflix_light_blue transition">
              Home
            </Link>
            <Link to="/movies" className="text-white hover:text-mnflix_light_blue transition">
              Movies
            </Link>
            <Link to="/browse" className="text-white hover:text-mnflix_light_blue transition">
              Browse
            </Link>
            <Link to="/my-list" className="text-white hover:text-mnflix_light_blue transition">
              My List
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-gray-900 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-mnflix_light_blue"
            />
          </form>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-md bg-mnflix_light_blue flex items-center justify-center text-white font-bold"
          >
            U
          </Link>
        </div>
      </nav>
    </header>
  )
}
