export default function Settings() {
  return (
    <div className="pt-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="space-y-8">
          <div className="bg-gray-900 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-6">Playback Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Default Quality</label>
                <select className="w-full bg-gray-800 text-white px-4 py-2 rounded-md">
                  <option>Auto</option>
                  <option>1080p</option>
                  <option>720p</option>
                  <option>480p</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Autoplay Next Episode</label>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-6">Account Settings</h3>
            <div className="space-y-4">
              <button className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition">
                Change Password
              </button>
              <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
