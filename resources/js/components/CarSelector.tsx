import { useEffect, useState } from "react";

interface Option {
  value: number;
  title: string;
  engine_capacity?: number;
  transmission?: string;
  submodel?: string;
  submodel_id?: number;
}

interface CarSelectorProps {
  onSelectMake: (make: Option | null) => void;
  onSelectModel: (model: Option | null) => void;
  onSelectYear: (year: string) => void;
  onSelectVariant: (variant: Option | null) => void;
}

export default function CarSelector({
  onSelectMake,
  onSelectModel,
  onSelectYear,
  onSelectVariant,
}: CarSelectorProps) {
  const [makes, setMakes] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [years, setYears] = useState<Option[]>([]);
  const [variants, setVariants] = useState<Option[]>([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");

  const currentYear = new Date().getFullYear();

  // 初始化年份列表
  useEffect(() => {
    const yearList: Option[] = [];
    for (let y = currentYear; y >= 2000; y--) {
      yearList.push({ value: y, title: String(y) });
    }
    setYears(yearList);
  }, []);

  // 获取 Makes
  useEffect(() => {
    fetch(
      "https://crazy-rabbit-api.carro.sg/api/v1/rabbit/my/config/options?types[0][name]=makes"
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data?.makes?.data;
        if (Array.isArray(list)) setMakes(list);
      });
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
        setVariants([]);
        setSelectedVariant("");
      });
  }, [selectedMake]);

  // 获取 Years
  useEffect(() => {
    if (!selectedModel) {
      setYears([]);
      setSelectedYear("");
      return;
    }

    fetch(
      `https://crazy-rabbit-api.carro.sg/api/v1/rabbit/my/config/options?types[0][name]=manufacture_years&types[0][filter]=${selectedModel}&types[0][filter2]=model`
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data?.manufacture_years;
        if (Array.isArray(list)) {
          setYears(list.map((y: number) => ({ value: y, title: y.toString() })));
        }
        setSelectedYear("");
        setVariants([]);
        setSelectedVariant("");
      });
  }, [selectedModel]);

  // 获取 Variants
  useEffect(() => {
    if (!selectedModel || !selectedYear) {
      setVariants([]);
      setSelectedVariant("");
      return;
    }

    fetch(
      `https://crazy-rabbit-api.carro.sg/api/v1/rabbit/my/config/options?types[0][name]=submodel_variants&types[0][filter]=${selectedModel}&types[0][filter2]=${selectedYear}&types[0][filter3]=model`
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data?.submodel_variants?.data;
        if (Array.isArray(list)) setVariants(list);
        setSelectedVariant("");
      });
  }, [selectedModel, selectedYear]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col gap-4 md:flex-row md:gap-4">
        {/* Make */}
        <div className="flex-1">
          <select
            value={selectedMake}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedMake(value);
              
              // 找到选中的make对象，传递完整信息
              const selectedMakeObj = makes.find(make => make.value.toString() === value);
              onSelectMake(selectedMakeObj || null);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-gray-900 transition"
          >
            <option value="">Brand</option>
            {makes.map((make) => (
              <option key={make.value} value={make.value}>
                {make.title}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="flex-1">
          <select
            value={selectedModel}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedModel(value);
              
              // 找到选中的model对象，传递完整信息
              const selectedModelObj = models.find(model => model.value.toString() === value);
              onSelectModel(selectedModelObj || null);
            }}
            disabled={!models.length}
            className={`w-full p-3 border rounded-lg shadow-sm bg-white text-gray-900 transition ${
              models.length
                ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
          >
            <option value="">Model</option>
            {models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.title}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="flex-1">
          <select
            value={selectedYear}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedYear(value);
              onSelectYear(value);
            }}
            disabled={!selectedModel}
            className={`w-full p-3 border rounded-lg shadow-sm bg-white text-gray-900 transition ${
              selectedModel
                ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year.value} value={year.value}>
                {year.title}
              </option>
            ))}
          </select>
        </div>

        {/* Variant */}
        <div className="flex-1">
          <select
            value={selectedVariant}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedVariant(value);
              
              // 找到选中的variant对象，传递完整信息
              const selectedVariantObj = variants.find(variant => variant.value.toString() === value);
              onSelectVariant(selectedVariantObj || null);
            }}
            disabled={!variants.length}
            className={`w-full p-3 border rounded-lg shadow-sm bg-white text-gray-900 transition ${
              variants.length
                ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
          >
            <option value="">Variant</option>
            {variants.map((v) => (
              <option key={v.value} value={v.value}>
                {v.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}