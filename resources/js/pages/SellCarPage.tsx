  import { useState } from "react";
  import CarSelector from "../components/CarSelector";
  import Footer from "@/components/Footer";
  import Header from "@/components/Header";
  import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

  export default function SellCarPage() {
    const [color, setColor] = useState("");
    const [year, setYear] = useState("");
    const [mileage, setMileage] = useState("");
  // price holds the numeric string without commas (e.g. "123000")
  const [price, setPrice] = useState("");
  // Format numeric string like "123000" => "123,000"
  const formatWithCommas = (numStr: string) => {
    if (!numStr) return "";
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [selectedMake, setSelectedMake] = useState<any>(null);
    const [selectedModel, setSelectedModel] = useState<any>(null);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState<string>("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        setImages((prev) => [...prev, ...newFiles]);
      }
    };

    const removeImage = (index: number) => {
      setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedMake || !selectedModel || !selectedVariant || !selectedYear) {
        setMessage("Please select Make, Model, Year, and Variant.");
        return;
      }

      // Robust token retrieval: handle missing, empty, or stringified null/undefined
      const getToken = () => {
        if (typeof window === "undefined") return null;
        const t = localStorage.getItem("token");
        if (!t) return null;
        const tn = t.trim();
        if (tn === "" || tn.toLowerCase() === "null" || tn.toLowerCase() === "undefined") return null;
        return tn;
      };

      const token = getToken();
      if (!token) {
        setMessage("You must be logged in to submit the form.");
        return;
      }

      const formData = new FormData();
      formData.append("make_id", selectedMake.value);
      formData.append("make_title", selectedMake.title || "");
      formData.append("model_id", selectedModel.value);
      formData.append("model_title", selectedModel.title || "");
      formData.append("variant_id", selectedVariant.value);
      formData.append("variant_title", selectedVariant.title || "");
      formData.append("year", String(Number(selectedYear)));
      formData.append("color", color);
      formData.append("mileage", String(Number(mileage)));
      formData.append("price", String(Number(price)));
      formData.append("description", description);
      images.forEach((img) => {
        formData.append("images[]", img);
      });

      setLoading(true);
      setMessage("");

      try {
        const res = await fetch("http://127.0.0.1:8000/api/cars", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData, // FormData 自动带 multipart/form-data
        });

        const text = await res.text(); // 先取原始响应，避免 JSON 解析失败
        console.log("Raw response:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Server did not return valid JSON. Response was: " + text);
        }

        if (res.ok) {
          setMessage("Car listed successfully!");
          setImages([]);
        } else {
          setMessage(data.message || `Error: ${res.status} ${res.statusText}`);
        }
      } catch (err) {
        setMessage("Network error: " + (err instanceof Error ? err.message : "An unknown error occurred"));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex flex-col min-h-screen bg-white text-black">
        <Header />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4 text-black">Sell Your Car</h1>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
            <CarSelector
              onSelectMake={setSelectedMake}
              onSelectModel={setSelectedModel}
              onSelectYear={setSelectedYear}
              onSelectVariant={setSelectedVariant}
            />
            <input
              type="text"
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-black"
            />
            <input
              type="number"
              placeholder="Mileage (km)"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-black"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Price (RM)"
              value={formatWithCommas(price)}
              onChange={(e) => {
                // Allow digits and commas, strip non-digits when storing
                const raw = e.target.value.replace(/,/g, '');
                // Accept only digits
                const numeric = raw.replace(/[^0-9]/g, '');
                setPrice(numeric);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-black"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-black"
            />
            <div>
              <label className="block font-medium mb-2 text-black">Upload Images</label>
              <div className="flex flex-wrap gap-4">
                {images.map((file, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <PlusIcon className="w-8 h-8 text-black" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
          {message && <p className="mt-4 text-center text-black">{message}</p>}
        </main>
        <Footer />
      </div>
    );
  }