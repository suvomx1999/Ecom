export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white shadow sm:rounded-lg p-6">
        <p className="text-gray-500">Admin settings configuration will go here.</p>
        <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Configure global application settings.</p>
            {/* Add forms or toggles here later */}
        </div>
      </div>
    </div>
  );
}
