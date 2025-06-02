import { Link } from "react-router-dom";

export default function Navbar({
  onLogout,
  isAuthenticated,
  isLoading = false,
}) {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div className="flex items-center py-4 px-2">
              <Link to="/" className="text-gray-700 font-semibold text-xl">
                BookScraper
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isLoading && (
              <div className="text-gray-500 text-sm">Loading...</div>
            )}
            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-gray-300 transition duration-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
