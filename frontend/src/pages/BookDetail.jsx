import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/books/${id}`);
        setBook(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch book");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading)
    return <div className="text-center py-8">Loading book details...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!book) return <div className="text-center py-8">Book not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:mt-5">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
        <div className="flex flex-col md:flex-row gap-8 ">
          <div className="md:w-1/3">
            <div className="bg-gray-200 h-full w-full p-4 flex items-center justify-center rounded-lg">
              <img
                src={book.image}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="py-4">
              <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
            </div>

            <div className="mb-6 md:mt-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < book.rating ? "text-yellow-400" : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
                <span className="ml-1 text-gray-500">({book.rating}/5)</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Product Information
              </h3>
              <div className="grid grid-cols-2 gap-4 md:mt-5">
                <div>
                  <p className="text-sm text-gray-600">Price (excl. tax)</p>
                  <p className="font-medium">Rs {book.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Availability</p>
                  <p className="font-medium">
                    {book.availability ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <p className="font-medium">{book.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scraped At</p>
                  <p className="font-medium">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
