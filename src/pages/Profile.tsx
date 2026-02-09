export default function Profile() {
  return (
    <div className="pt-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-mnflix_light_blue flex items-center justify-center text-white text-3xl font-bold">
              U
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">User Name</h2>
              <p className="text-gray-400">user@example.com</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-8">
          <h3 className="text-xl font-bold mb-6">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value="user@example.com"
                disabled
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Subscription Plan</label>
              <input
                type="text"
                value="Premium"
                disabled
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
