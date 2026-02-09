import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-mnflix_light_blue mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-mnflix_light_blue text-white rounded-md hover:bg-opacity-90 transition font-semibold inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
