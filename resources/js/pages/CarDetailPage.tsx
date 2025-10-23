import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { placeOrder } from "@/services/orders";

interface Car {
  id: number;
  year: number;
  price: number;
  color?: string;
  description?: string;
  user_id?: number; // ✅ 加上 owner id
  make?: { id: number; name: string };
  model?: { id: number; name: string };
  variant?: { id: number; name: string };
  images: { id: number; image_path: string }[];
  main_image_id?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function CarDetailPage() {
  const carId = window.location.pathname.split("/")[2];
  const [car, setCar] = useState<Car | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showTestDrive, setShowTestDrive] = useState(false);
  const [showBuyConfirm, setShowOrderConfirm] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);

  const [tdName, setTdName] = useState("");
  const [tdPhone, setTdPhone] = useState("");
  const [tdDate, setTdDate] = useState("");

  // ✅ 载入车辆资料
  useEffect(() => {
    if (!carId) return;

    fetch(`http://127.0.0.1:8000/api/cars/${carId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch car");
        return res.json();
      })
      .then((data) => {
        setCar(data);
        setCurrentImage(0);
      })
      .catch(() => setError("Failed to load car data"))
      .finally(() => setLoading(false));
  }, [carId]);

  // ✅ 载入当前登录用户
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://127.0.0.1:8000/api/user", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAuthUser(data))
      .catch(() => setAuthUser(null));
  }, []);

  if (loading) return <p className="text-center p-6">Loading car...</p>;
  if (error) return <p className="text-center p-6 text-red-500">{error}</p>;
  if (!car) return <p className="text-center p-6">Car not found.</p>;

  const isOwner = authUser && authUser.id === car.user_id;

  // ✅ 图片切换
  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

   const handleEdit = (carId: number) => {
    window.location.href = `/cars/${carId}/edit`;
  };

  // ✅ 删除 Listing
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/cars/${car.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete listing");
      alert("Listing deleted successfully!");
      window.location.href = "/my-cars";
    } catch (err: any) {
      alert("Failed to delete listing: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左边图片轮播 */}
          <div className="md:w-2/3 relative">
            {car.images.length > 0 ? (
              <div className="relative">
                <img
                  src={`http://127.0.0.1:8000/storage/${car.images[currentImage].image_path}`}
                  alt="Car"
                  className="w-full h-96 object-cover rounded-lg border"
                />
                {/* 左右箭头 */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                    >
                      &#8592;
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                    >
                      &#8594;
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                No Image
              </div>
            )}
            {/* 小图缩略 */}
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {car.images.map((img, idx) => (
                <img
                  key={img.id}
                  src={`http://127.0.0.1:8000/storage/${img.image_path}`}
                  alt="thumb"
                  className={`w-20 h-20 object-cover rounded-lg border cursor-pointer ${
                    idx === currentImage
                      ? "border-indigo-600 border-2"
                      : "border-gray-300"
                  }`}
                  onClick={() => setCurrentImage(idx)}
                />
              ))}
            </div>
          </div>

          {/* 右边信息 + 按钮 */}
          <div className="md:w-1/3 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {car.make?.name} {car.model?.name} {car.variant?.name}
              </h1>
              <p className="mb-1">
                <strong>Year:</strong> {car.year}
              </p>
              <p className="mb-1">
                <strong>Price:</strong> RM {(Number(car.price)).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </p>
              {car.color && (
                <p className="mb-1">
                  <strong>Color:</strong> {car.color}
                </p>
              )}
            </div>

            {/* ✅ 按钮区域逻辑 */}
            <div className="mt-6 grid gap-3">
              {isOwner ? (
                <>
                  <button
                    onClick={() => handleEdit(car.id)}
                    className="w-full py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Edit Listing
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Listing
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowTestDrive(true)}
                    className="w-full py-3 bg-white border border-gray-300 text-black font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Book Test Drive
                  </button>

                  <button
                    onClick={() => setShowOrderConfirm(true)}
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Order Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 描述 */}
        {car.description && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 text-gray-700">
            <h2 className="font-semibold mb-2">Description</h2>
            <p>{car.description}</p>
          </div>
        )}
      </main>
      <Footer />

      {/* Test Drive Modal */}
      {showTestDrive && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <h3 className="text-lg font-semibold mb-3">Book a Test Drive</h3>
            <div className="space-y-2">
              <input
                className="w-full border p-2 rounded"
                placeholder="Your name"
                value={tdName}
                onChange={(e) => setTdName(e.target.value)}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Phone"
                value={tdPhone}
                onChange={(e) => setTdPhone(e.target.value)}
              />
              <input
                type="datetime-local"
                className="w-full border p-2 rounded"
                value={tdDate}
                onChange={(e) => setTdDate(e.target.value)}
              />
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setShowTestDrive(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-indigo-600 text-white"
                onClick={() => {
                  setShowTestDrive(false);
                  alert(
                    `Test drive requested for ${tdDate}. We will contact ${tdPhone}.`
                  );
                  setTdName("");
                  setTdPhone("");
                  setTdDate("");
                }}
              >
                Request Test Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Confirmation Modal */}
      {showBuyConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <h3 className="text-lg font-semibold mb-3">Confirm Order</h3>
            <p>
              You're about to place an order for{" "}
              <strong>
                {car.make?.name} {car.model?.name}
              </strong>{" "}
              at <strong>RM {car.price.toLocaleString()}</strong>.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setShowOrderConfirm(false)}
              >
                Cancel
              </button>
              <button
                disabled={buyLoading}
                className="px-4 py-2 rounded bg-indigo-600 text-white"
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    alert("Please login to place an order");
                    return;
                  }
                  try {
                    setBuyLoading(true);
                    const payload = {
                      car_id: car.id,
                      total_price: car.price,
                      order_items: [{ id: car.id, qty: 1 }],
                    };
                    await placeOrder(token, payload);
                    setShowOrderConfirm(false);
                    alert("Order placed successfully!");
                    window.location.href = "/my-orders";
                  } catch (err: any) {
                    console.error(err);
                    const msg =
                      err?.response?.data?.message ||
                      JSON.stringify(err?.response?.data || err.message);
                    alert("Failed to place order: " + msg);
                  } finally {
                    setBuyLoading(false);
                  }
                }}
              >
                {buyLoading ? "Placing..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
