import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useOutletContext();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/books", {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm || undefined,
          },
        });
        setBooks(response.data.books);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
          pages: response.data.pages,
        }));
      } catch (err) {
        setError("Failed to fetch books");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(timer);
  }, [isAuthenticated, pagination.page, pagination.limit, searchTerm]);

  const handleScrape = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/scrape");
      if (data.statusCode) {
        toast.success(`Scraped ${data.data.count} books successfully!`);
      } else {
        toast.error(data.error || "Scraping failed");
      }

      setPagination((prev) => ({ ...prev, page: 1 }));
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      toast.error(`Request failed: ${errorMsg}`);
      console.error("Scraping error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

 return (
  <div className="md:py-8 py-2 md:px-6">
    <h1 className="text-3xl font-bold md:mb-4 mb-2 px-1 md:mx-3">Books</h1>
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-1 md:mx-3 gap-2">
      <input
        type="text"
        placeholder="Search books..."
        className="px-4 py-2 border rounded-md w-full md:w-1/2"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
      />
      <button
        onClick={handleScrape}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-white w-full md:w-auto md:min-w-[150px] ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : "Scrape Now"}
      </button>
    </div>

    {error && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
      </div>
    )}

    <div className="bg-white rounded-lg shadow overflow-hidden">
      {books.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No books found. Try scraping some first!
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Cover
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr
                    key={book._id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(`/books/${book._id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <img
                          src={book.image}
                          alt={book.title}
                          className="h-16 w-12 object-contain"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/50x75?text=No+Image";
                            e.target.className = "h-16 w-12 object-contain bg-gray-100";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {book.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      ${book.price?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < book.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-xs text-gray-500">
                          {book.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          book.availability
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.availability ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between items-center">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1 || loading}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.pages || loading}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
        </>
      )}
    </div>
  </div>
);
}
