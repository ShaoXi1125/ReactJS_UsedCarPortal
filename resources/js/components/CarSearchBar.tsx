import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

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

interface CarSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
}

export default function CarSearchBar({
  onSearch,
  placeholder = "Search cars by make, model, year...",
  className = "",
}: CarSearchBarProps) {
  const [searchText, setSearchText] = useState("");
  const [makes, setMakes] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [year, setYear] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  // helpers to format/parse comma separated numbers
  const formatWithCommas = (numStr: string) => {
    if (!numStr) return "";
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const parseNumber = (display: string) => {
    if (!display) return null;
    const digits = display.replace(/,/g, '').replace(/[^0-9]/g, '');
    return digits ? parseInt(digits, 10) : null;
  };
  const [isExpanded, setIsExpanded] = useState(false);

  // 获取 Makes
  useEffect(() => {
    fetch(
      "https://crazy-rabbit-api.carro.sg/api/v1/rabbit/my/config/options?types[0][name]=makes"
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data?.makes?.data;
        if (Array.isArray(list)) setMakes(list);
      })
      .catch((err) => console.error("Failed to fetch makes:", err));
  }, []);

  // 获取 Models
  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      setSelectedModel("");
      return;
    }

    fetch(
      `https://crazy-rabbit-api.carro.sg/api/v1/rabbit/my/config/options?types[0][name]=models&types[0][filter]=${selectedMake}`
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data?.models?.data;
        if (Array.isArray(list)) setModels(list);
        setSelectedModel("");
      })
      .catch((err) => console.error("Failed to fetch models:", err));
  }, [selectedMake]);

  
  useEffect(() => {
    const selectedMakeObj = makes.find(
      (make) => make.value.toString() === selectedMake
    );
    const selectedModelObj = models.find(
      (model) => model.value.toString() === selectedModel
    );

  onSearch({
        searchText,
        selectedMake: selectedMakeObj || null,
        selectedModel: selectedModelObj || null,
        year: year ? parseInt(year, 10) : null,
    priceMin: parseNumber(priceMin),
    priceMax: parseNumber(priceMax),
    });
  }, [
    searchText,
    selectedMake,
    selectedModel,
    year,
    priceMin,
    priceMax,
    makes,
    models,
    onSearch,
  ]);

  const handleClearSearch = () => {
    setSearchText("");
    setSelectedMake("");
    setSelectedModel("");
    setYear("");
    setPriceMin("");
    setPriceMax("");
    setIsExpanded(false);
  };

  const hasActiveFilters =
    searchText || selectedMake || selectedModel || year || priceMin || priceMax;

  return (
    <div className={`w-full ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-12 pr-20 py-4 text-lg text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearSearch}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Clear all filters"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md border border-indigo-200 hover:border-indigo-300 transition-colors"
            >
              {isExpanded ? "Hide Filters" : "More Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Make Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-gray-900"
              >
                <option value="">All Brands</option>
                {makes.map((make) => (
                  <option key={make.value} value={make.value}>
                    {make.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                }}
                disabled={!models.length}
                className={`w-full p-3 border rounded-lg shadow-sm bg-white text-gray-900 ${
                  models.length
                    ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              >
                <option value="">
                  {selectedMake ? "All Models" : "Select a brand first"}
                </option>
                {models.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-gray-900"
              >
                <option value="">All Years</option>
                {Array.from({ length: 25 }).map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Price Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price (RM)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formatWithCommas(priceMin)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '');
                  const numeric = raw.replace(/[^0-9]/g, '');
                  setPriceMin(numeric);
                }}
                placeholder="e.g. 20,000"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-gray-900"
              />
            </div>

            {/* Price Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (RM)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formatWithCommas(priceMax)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '');
                  const numeric = raw.replace(/[^0-9]/g, '');
                  setPriceMax(numeric);
                }}
                placeholder="e.g. 100,000"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchText && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Search: "{searchText}"
                  <button
                    onClick={() => setSearchText("")}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedMake && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Brand:{" "}
                  {makes.find((m) => m.value.toString() === selectedMake)?.title}
                  <button
                    onClick={() => setSelectedMake("")}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedModel && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Model:{" "}
                  {
                    models.find((m) => m.value.toString() === selectedModel)
                      ?.title
                  }
                  <button
                    onClick={() => setSelectedModel("")}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {year && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Year: {year}
                  <button
                    onClick={() => setYear("")}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(priceMin || priceMax) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Price:{" "}
                  {priceMin ? `RM ${priceMin}` : "Any"} -{" "}
                  {priceMax ? `RM ${priceMax}` : "Any"}
                  <button
                    onClick={() => {
                      setPriceMin("");
                      setPriceMax("");
                    }}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
