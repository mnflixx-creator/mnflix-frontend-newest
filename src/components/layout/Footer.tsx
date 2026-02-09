import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-mnflix_blue border-t border-gray-800 py-8 mt-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-mnflix_light_blue font-bold text-lg mb-4">MNFLIX</h3>
            <p className="text-gray-400 text-sm">
              Stream unlimited movies and TV series
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-gray-400 hover:text-white transition text-sm">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-400 hover:text-white transition text-sm">
                  Browse
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition text-sm">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-gray-400 hover:text-white transition text-sm">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">Terms of Service</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MNFLIX. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
