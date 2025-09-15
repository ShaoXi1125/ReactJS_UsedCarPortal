import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarSearchBar from "@/components/CarSearchBar";

interface Make {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  make_id: number;
  make?: Make;
}

interface Variant {
  id: number;
  name: string;
  model_id: number;
  model?: Model;
}

interface CarImage {
  id: number;
  car_id: number;
  image_path: string;
}

interface Car {
  id: number;
  user_id: number;
  variant_id: number;
  year: number;
  mileage: number;
  price: number;
  color?: string;
  description?: string;
  variant?: Variant;
  images?: CarImage[];
}

interface Option {
  value: number;
  title: string;
}

interface SearchFilters {
  searchText: string;
  selectedMake: Option | null;
  selectedModel: Option | null;
  year: number | null;
  priceMin: number | null;
  priceMax: number | null;
}

export default function CarPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchText: "",
    selectedMake: null,
    selectedModel: null,
    year: null,
    priceMin: null,
    priceMax: null,
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get<Car[]>("/api/cars", {
        withCredentials: true,
      });
      setCars(response.data);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Failed to fetch cars");
    } finally {
      setLoading(false);
    }
  };

  

  // 过滤汽车数据
  const filteredCars = useMemo(() => {
    console.log("Current search filters:", searchFilters);
    
    return cars.filter((car) => {
      const searchLower = searchFilters.searchText.toLowerCase();
      
      // 文本搜索
      if (searchFilters.searchText) {
        const makeName = car.variant?.model?.make?.name?.toLowerCase() || "";
        const modelName = car.variant?.model?.name?.toLowerCase() || "";
        const variantName = car.variant?.name?.toLowerCase() || "";
        const year = car.year.toString();
        const color = car.color?.toLowerCase() || "";
        const description = car.description?.toLowerCase() || "";
        
        const searchText = `${makeName} ${modelName} ${variantName} ${year} ${color} ${description}`;
        if (!searchText.includes(searchLower)) {
          return false;
        }
      }
      
      // 品牌过滤
      if (searchFilters.selectedMake) {
        const carMakeName = car.variant?.model?.make?.name;
        if (carMakeName !== searchFilters.selectedMake.title) {
          return false;
        }
      }
      
      // 型号过滤
      if (searchFilters.selectedModel) {
        const carModelName = car.variant?.model?.name;
        if (carModelName !== searchFilters.selectedModel.title) {
          return false;
        }
      }
      
      // 年份过滤 - 添加调试日志
      if (searchFilters.year !== null) {
        console.log(`Filtering by year: ${searchFilters.year} (type: ${typeof searchFilters.year})`);
        console.log(`Car year: ${car.year} (type: ${typeof car.year})`);
        console.log(`Match: ${car.year === searchFilters.year}`);
        
        // 确保类型一致的比较
        if (Number(car.year) !== Number(searchFilters.year)) {
          console.log(`Car ${car.id} filtered out: year ${car.year} !== ${searchFilters.year}`);
          return false;
        }
      }
      
      // 最低价格过滤
      if (searchFilters.priceMin !== null) {
        if (car.price < searchFilters.priceMin) {
          return false;
        }
      }
      
      // 最高价格过滤
      if (searchFilters.priceMax !== null) {
        if (car.price > searchFilters.priceMax) {
          return false;
        }
      }
      
      return true;
    });
  }, [cars, searchFilters]);

  // 排序汽车数据
  const sortedCars = useMemo(() => {
    const sorted = [...filteredCars];
    
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "mileage":
        return sorted.sort((a, b) => a.mileage - b.mileage);
      case "year":
        return sorted.sort((a, b) => b.year - a.year);
      case "newest":
      default:
        return sorted.sort((a, b) => b.id - a.id); // 假设ID越大越新
    }
  }, [filteredCars, sortBy]);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow p-6 text-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Loading cars...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow p-6 text-gray-900 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-xl mb-4">{error}</p>
            <button
              onClick={fetchCars}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      {/* Search Section */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CarSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <main className="flex-grow p-6 text-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              Available Cars
              {filteredCars.length !== cars.length && (
                <span className="text-base font-normal text-gray-600 ml-2">
                  ({filteredCars.length} of {cars.length} cars)
                </span>
              )}
            </h1>
            
            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="mileage">Lowest Mileage</option>
                <option value="year">Newest Year</option>
              </select>
            </div>
          </div>

          {sortedCars.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {cars.length === 0 ? (
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </div>
              <p className="text-lg">
                {cars.length === 0 ? "No cars found." : "No cars match your search criteria."}
              </p>
              <p className="text-gray-500 mt-2">
                {cars.length === 0 
                  ? "Be the first to list your car!" 
                  : "Try adjusting your search filters or search terms."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCars.map((car) => (
                <div
                  key={car.id}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow duration-200 bg-white"
                >
                  {/* Car Image */}
                  <div className="relative mb-4">
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={`/storage/${car.images[0].image_path}`}
                        alt={`${car.variant?.model?.make?.name} ${car.variant?.model?.name} ${car.variant?.name}`}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {(!car.images || car.images.length === 0) && (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg
                            className="mx-auto h-12 w-12 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">No Image</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Fallback for failed image loads */}
                    <div className="hidden w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <span className="text-sm">Image failed to load</span>
                      </div>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div>
                    <h2 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">
                      {car.variant?.model?.make?.name} {car.variant?.name}
                    </h2>
                    
                    <div className="space-y-1 mb-3 text-sm">
                      <p className="text-gray-600 flex items-center justify-between">
                        <span>Year:</span>
                        <span className="font-medium">{car.year}</span>
                      </p>
                      <p className="text-gray-600 flex items-center justify-between">
                        <span>Mileage:</span>
                        <span className="font-medium">{car.mileage.toLocaleString()} km</span>
                      </p>
                      {car.color && (
                        <p className="text-gray-600 flex items-center justify-between">
                          <span>Color:</span>
                          <span className="font-medium">{car.color}</span>
                        </p>
                      )}
                    </div>

                    <p className="text-indigo-600 font-bold text-xl mb-3">
                      RM {car.price.toLocaleString()}
                    </p>

                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button  onClick={() => (window.location.href = `/CarDetail/${car.id}`)} className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        View Details
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}