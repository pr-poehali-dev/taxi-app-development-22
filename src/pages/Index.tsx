import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const DRIVERS = [
  {
    id: 1,
    name: "Александр К.",
    photo: "https://cdn.poehali.dev/projects/615a0f71-99e2-4854-879b-a252e6650525/files/0822130f-5e85-4353-938e-e631afd4cbbd.jpg",
    rating: 4.9,
    trips: 2341,
    car: "Toyota Camry • А123БВ",
    class: "comfort",
    eta: "3 мин",
    reviews: [
      { author: "Мария", text: "Отличный водитель, чистый салон!" },
      { author: "Дмитрий", text: "Быстро и комфортно, рекомендую." },
    ],
  },
  {
    id: 2,
    name: "Ирина Л.",
    photo: "https://cdn.poehali.dev/projects/615a0f71-99e2-4854-879b-a252e6650525/files/bde979c2-b7e9-43ed-995a-d61685ddd079.jpg",
    rating: 4.8,
    trips: 1876,
    car: "Kia K5 • В456ГД",
    class: "business",
    eta: "5 мин",
    reviews: [
      { author: "Анна", text: "Профессионал, очень приятно разговаривать." },
      { author: "Сергей", text: "Всегда пунктуальна, спасибо!" },
    ],
  },
  {
    id: 3,
    name: "Михаил Р.",
    photo: "https://cdn.poehali.dev/projects/615a0f71-99e2-4854-879b-a252e6650525/files/d4a3222e-2a80-45fc-bdde-d230326bfc50.jpg",
    rating: 4.7,
    trips: 3102,
    car: "Hyundai Sonata • Е789ЖЗ",
    class: "economy",
    eta: "2 мин",
    reviews: [
      { author: "Павел", text: "Быстро домчал, лучший цена-качество." },
      { author: "Ольга", text: "Вежливый, отлично знает город." },
    ],
  },
];

const CLASSES = [
  { id: "economy", label: "Эконом", icon: "Car", price: "от 199 ₽", color: "#22d3ee", base: 199, perKm: 22 },
  { id: "comfort", label: "Комфорт", icon: "Car", price: "от 349 ₽", color: "#a78bfa", base: 349, perKm: 35 },
  { id: "business", label: "Бизнес", icon: "Crown", price: "от 699 ₽", color: "#fb923c", base: 699, perKm: 60 },
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.4;
}

async function searchAddress(query: string, city: string) {
  if (query.length < 3) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " " + city)}&format=json&limit=5&accept-language=ru`
  );
  return res.json();
}

const PAYMENT_METHODS = [
  { id: "cash", label: "Наличные", icon: "Banknote", saved: false },
  { id: "card1", label: "•••• 4242", icon: "CreditCard", saved: true },
  { id: "card2", label: "•••• 8871", icon: "CreditCard", saved: true },
  { id: "sbp", label: "СБП", icon: "Smartphone", saved: false },
];

const HISTORY = [
  {
    id: 1,
    from: "ул. Тверская, 12",
    to: "Аэропорт Шереметьево",
    date: "Сегодня, 09:14",
    price: 1240,
    km: 34.2,
    class: "business",
    driver: "Александр К.",
    status: "completed",
  },
  {
    id: 2,
    from: "Арбат, 24",
    to: "ТЦ Мега Белая Дача",
    date: "Вчера, 18:42",
    price: 480,
    km: 14.1,
    class: "comfort",
    driver: "Ирина Л.",
    status: "completed",
  },
  {
    id: 3,
    from: "Проспект Мира, 54",
    to: "Парк Горького",
    date: "23 марта, 13:05",
    price: 310,
    km: 8.7,
    class: "economy",
    driver: "Михаил Р.",
    status: "completed",
  },
  {
    id: 4,
    from: "Кутузовский пр-т, 32",
    to: "Киевский вокзал",
    date: "21 марта, 07:30",
    price: 220,
    km: 4.3,
    class: "economy",
    driver: "Михаил Р.",
    status: "cancelled",
  },
];

const CLASS_COLORS: Record<string, string> = {
  economy: "#22d3ee",
  comfort: "#a78bfa",
  business: "#fb923c",
};

const CLASS_LABELS: Record<string, string> = {
  economy: "Эконом",
  comfort: "Комфорт",
  business: "Бизнес",
};

const CITIES = [
  "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург",
  "Казань", "Нижний Новгород", "Краснодар", "Самара",
  "Ростов-на-Дону", "Уфа", "Воронеж", "Пермь",
];

export default function Index() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedClass, setSelectedClass] = useState("comfort");
  const [selectedPayment, setSelectedPayment] = useState("card1");
  const [activeDriver, setActiveDriver] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"order" | "drivers" | "history">("order");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [city, setCity] = useState("Москва");
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  const [fromSuggestions, setFromSuggestions] = useState<{display_name: string; lat: string; lon: string}[]>([]);
  const [toSuggestions, setToSuggestions] = useState<{display_name: string; lat: string; lon: string}[]>([]);
  const [fromCoords, setFromCoords] = useState<{lat: number; lon: number} | null>(null);
  const [toCoords, setToCoords] = useState<{lat: number; lon: number} | null>(null);
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const distance = fromCoords && toCoords
    ? getDistance(fromCoords.lat, fromCoords.lon, toCoords.lat, toCoords.lon)
    : null;

  const currentClass = CLASSES.find((c) => c.id === selectedClass)!;
  const price = distance ? Math.round(currentClass.base + currentClass.perKm * distance) : null;

  function handleFromChange(val: string) {
    setFrom(val);
    setFromCoords(null);
    if (searchTimer) clearTimeout(searchTimer);
    const t = setTimeout(async () => {
      const results = await searchAddress(val, city);
      setFromSuggestions(results);
    }, 500);
    setSearchTimer(t);
  }

  function handleToChange(val: string) {
    setTo(val);
    setToCoords(null);
    if (searchTimer) clearTimeout(searchTimer);
    const t = setTimeout(async () => {
      const results = await searchAddress(val, city);
      setToSuggestions(results);
    }, 500);
    setSearchTimer(t);
  }

  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ru`
          );
          const data = await res.json();
          const detected =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county;
          const road = data.address?.road || data.address?.pedestrian || data.address?.suburb || "";
          const house = data.address?.house_number ? `, ${data.address.house_number}` : "";
          if (road) setFrom(road + house);
          if (detected) {
            const matched = CITIES.find((c) =>
              c.toLowerCase().includes(detected.toLowerCase()) ||
              detected.toLowerCase().includes(c.toLowerCase())
            );
            setCity(matched || detected);
          }
        } catch {
          // Оставляем Москву по умолчанию
        } finally {
          setGeoLoading(false);
        }
      },
      () => setGeoLoading(false),
      { timeout: 6000 }
    );
  }, []);

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#0a0a0f", fontFamily: "'Golos Text', sans-serif" }}
    >
      {/* BG ambient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            top: "-20%", left: "-10%",
            width: 600, height: 600,
            background: "#7c3aed",
            opacity: 0.18,
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-10%", right: "-5%",
            width: 500, height: 500,
            background: "#f97316",
            opacity: 0.13,
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "40%", right: "20%",
            width: 300, height: 300,
            background: "#06b6d4",
            opacity: 0.09,
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f97316, #7c3aed)" }}
          >
            <Icon name="Zap" size={16} className="text-white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px" }}>Такси с нами</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Icon name="Bell" size={15} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
            style={{ background: "linear-gradient(135deg, #f97316, #7c3aed)" }}
          >
            АВ
          </div>
        </div>
      </header>

      {/* City modal */}
      {cityOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => { setCityOpen(false); setCitySearch(""); }}
        >
          <div
            className="w-full rounded-t-3xl p-5 pb-8"
            style={{ background: "#14141c", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.2)" }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Выберите город</h3>
            <input
              autoFocus
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Поиск города..."
              className="w-full rounded-xl outline-none text-sm text-white mb-3"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "10px 14px",
                color: "#fff",
              }}
            />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setCityOpen(false); setCitySearch(""); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: city === c ? "rgba(168,85,247,0.15)" : "transparent",
                    border: city === c ? "1px solid rgba(168,85,247,0.4)" : "1px solid transparent",
                    color: city === c ? "#fff" : "rgba(255,255,255,0.6)",
                    fontWeight: city === c ? 700 : 400,
                  }}
                >
                  <span>{c}</span>
                  {city === c && <Icon name="Check" size={14} style={{ color: "#a855f7" }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative z-10 px-6 pt-8 pb-6">
        <button
          onClick={() => setCityOpen(true)}
          className="flex items-center gap-1 mb-1 transition-opacity hover:opacity-70"
        >
          {geoLoading ? (
            <Icon name="Loader" size={14} style={{ color: "rgba(255,255,255,0.35)", animation: "spin 1s linear infinite" }} />
          ) : (
            <Icon name="MapPin" size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
          )}
          <p
            className="text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}
          >
            {geoLoading ? "Определяю..." : city.toUpperCase()}
          </p>
          {!geoLoading && <Icon name="ChevronDown" size={14} style={{ color: "rgba(255,255,255,0.35)" }} />}
        </button>
        <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
          Куда{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #f97316, #a855f7, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            едем?
          </span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 8 }}>
          48 водителей рядом с вами
        </p>
      </div>

      {/* Tabs */}
      <div className="relative z-10 px-6 mb-4">
        <div
          className="flex gap-1 p-1 w-fit rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {[
            { id: "order", label: "Заказ", icon: "MapPin" },
            { id: "drivers", label: "Водители", icon: "Users" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "order" | "drivers")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={
                activeTab === tab.id
                  ? {
                      background: "linear-gradient(135deg, #f97316, #a855f7)",
                      color: "#fff",
                    }
                  : { color: "rgba(255,255,255,0.45)" }
              }
            >
              <Icon name={tab.icon as "MapPin" | "Users"} size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 px-6 pb-28">
        {activeTab === "order" && (
          <div className="space-y-4">
            {/* Route */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h2
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}
              >
                МАРШРУТ
              </h2>
              <div className="space-y-2">
                {/* From */}
                <div className="relative">
                  <div
                    className="absolute rounded-full"
                    style={{ left: 12, top: 16, width: 8, height: 8, background: "#22d3ee" }}
                  />
                  <input
                    value={from}
                    onChange={(e) => handleFromChange(e.target.value)}
                    placeholder="Откуда"
                    className="w-full rounded-xl text-sm text-white outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      padding: "12px 16px 12px 28px",
                      color: "#fff",
                    }}
                  />
                  {fromSuggestions.length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-30"
                      style={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {fromSuggestions.map((s, i) => (
                        <button
                          key={i}
                          className="w-full text-left px-3 py-2.5 text-xs transition-colors hover:bg-white/5"
                          style={{ color: "rgba(255,255,255,0.75)", borderBottom: i < fromSuggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                          onClick={() => {
                            setFrom(s.display_name.split(",").slice(0, 2).join(","));
                            setFromCoords({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
                            setFromSuggestions([]);
                          }}
                        >
                          {s.display_name.split(",").slice(0, 3).join(",")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* To */}
                <div className="relative">
                  <div
                    className="absolute"
                    style={{ left: 12, top: 16, transform: "rotate(45deg)", width: 8, height: 8, background: "#f97316" }}
                  />
                  <input
                    value={to}
                    onChange={(e) => handleToChange(e.target.value)}
                    placeholder="Куда"
                    className="w-full rounded-xl text-sm text-white outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      padding: "12px 16px 12px 28px",
                      color: "#fff",
                    }}
                  />
                  {toSuggestions.length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-30"
                      style={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {toSuggestions.map((s, i) => (
                        <button
                          key={i}
                          className="w-full text-left px-3 py-2.5 text-xs transition-colors hover:bg-white/5"
                          style={{ color: "rgba(255,255,255,0.75)", borderBottom: i < toSuggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                          onClick={() => {
                            setTo(s.display_name.split(",").slice(0, 2).join(","));
                            setToCoords({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
                            setToSuggestions([]);
                          }}
                        >
                          {s.display_name.split(",").slice(0, 3).join(",")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price estimate */}
              {price && distance && (
                <div
                  className="mt-3 rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}
                >
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Примерная стоимость</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                      {price.toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Расстояние</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#a855f7" }}>
                      {distance.toFixed(1)} км
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Class */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h2
                className="text-xs font-semibold mb-3"
                style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}
              >
                КЛАСС
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {CLASSES.map((cls) => {
                  const active = selectedClass === cls.id;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls.id)}
                      className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200"
                      style={{
                        border: active ? `1px solid ${cls.color}55` : "1px solid rgba(255,255,255,0.08)",
                        background: active ? `${cls.color}15` : "transparent",
                        color: active ? "#fff" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      <Icon
                        name={cls.icon as "Car" | "Crown"}
                        size={20}
                        style={{ color: active ? cls.color : undefined }}
                      />
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{cls.label}</span>
                      <span style={{ fontSize: 10, opacity: 0.55 }}>
                        {distance ? `${Math.round(cls.base + cls.perKm * distance).toLocaleString("ru-RU")} ₽` : cls.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}
                >
                  ОПЛАТА
                </h2>
                <button
                  className="text-xs font-semibold flex items-center gap-1 transition-colors"
                  style={{ color: "#a855f7" }}
                >
                  <Icon name="Plus" size={12} />
                  Добавить карту
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const active = selectedPayment === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id)}
                      className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        border: active ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.08)",
                        background: active ? "rgba(168,85,247,0.1)" : "transparent",
                        color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      }}
                    >
                      <Icon
                        name={pm.icon as "Banknote" | "CreditCard" | "Smartphone"}
                        size={14}
                        style={{ color: active ? "#a855f7" : undefined }}
                      />
                      <span style={{ fontSize: 11 }}>{pm.label}</span>
                      {pm.saved && (
                        <span
                          className="ml-auto font-bold rounded-full px-1.5 py-0.5"
                          style={{ fontSize: 9, background: "rgba(34,211,238,0.15)", color: "#22d3ee" }}
                        >
                          Сохр.
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Button */}
            {!orderPlaced ? (
              <button
                onClick={() => setOrderPlaced(true)}
                className="w-full py-4 rounded-2xl font-black text-lg text-white relative overflow-hidden transition-transform active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #a855f7 50%, #22d3ee 100%)",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Zap" size={20} />
                  Заказать такси
                </span>
              </button>
            ) : (
              <div
                className="w-full py-4 rounded-2xl font-bold text-center text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
              >
                <Icon name="CheckCircle" size={20} />
                Водитель найден! Едет 3 мин
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>
                {HISTORY.length} поездки
              </p>
              <p className="text-xs font-bold" style={{ color: "#a855f7" }}>
                Итого: {HISTORY.filter(h => h.status === "completed").reduce((s, h) => s + h.price, 0).toLocaleString("ru-RU")} ₽
              </p>
            </div>
            {HISTORY.map((trip) => (
              <div
                key={trip.id}
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${trip.status === "cancelled" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>{trip.date}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full font-bold"
                        style={{ fontSize: 10, background: `${CLASS_COLORS[trip.class]}18`, color: CLASS_COLORS[trip.class] }}
                      >
                        {CLASS_LABELS[trip.class]}
                      </span>
                      {trip.status === "cancelled" && (
                        <span className="px-2 py-0.5 rounded-full font-bold" style={{ fontSize: 10, background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                          Отменён
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: 20, fontWeight: 900, color: trip.status === "cancelled" ? "rgba(255,255,255,0.3)" : "#fff", textDecoration: trip.status === "cancelled" ? "line-through" : "none" }}>
                      {trip.price.toLocaleString("ru-RU")} ₽
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{trip.km} км</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#22d3ee" }} />
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{trip.from}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 flex-shrink-0 rotate-45" style={{ background: "#f97316" }} />
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{trip.to}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    Водитель: <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{trip.driver}</span>
                  </p>
                  <button
                    style={{ fontSize: 11, color: "#a855f7", fontWeight: 600 }}
                    onClick={() => {
                      setFrom(trip.from);
                      setTo(trip.to);
                      setActiveTab("order");
                    }}
                  >
                    Повторить →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "drivers" && (
          <div className="space-y-4">
            <p
              className="text-xs font-semibold uppercase"
              style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}
            >
              {DRIVERS.length} водителей доступно
            </p>
            {DRIVERS.map((driver) => (
              <div
                key={driver.id}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={driver.photo}
                      alt={driver.name}
                      className="rounded-xl object-cover"
                      style={{ width: 64, height: 64 }}
                    />
                    <div
                      className="absolute flex items-center gap-0.5 rounded-lg px-1.5 py-0.5"
                      style={{
                        bottom: -6, right: -6,
                        background: "#0a0a0f",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <span style={{ color: "#fbbf24", fontSize: 10 }}>★</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{driver.rating}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontWeight: 700, color: "#fff" }}>{driver.name}</span>
                      <span
                        className="font-bold rounded-full px-2 py-0.5"
                        style={{ fontSize: 11, background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}
                      >
                        {driver.eta}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }} className="truncate">
                      {driver.car}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                      {driver.trips.toLocaleString("ru-RU")} поездок
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveDriver(activeDriver === driver.id ? null : driver.id)}
                  className="w-full px-4 pb-3 flex items-center gap-1 font-semibold transition-colors"
                  style={{ fontSize: 12, color: "#a855f7" }}
                >
                  <Icon
                    name={activeDriver === driver.id ? "ChevronUp" : "ChevronDown"}
                    size={14}
                  />
                  {activeDriver === driver.id ? "Скрыть отзывы" : "Отзывы пассажиров"}
                </button>

                {activeDriver === driver.id && (
                  <div
                    className="px-4 pb-4 space-y-2 pt-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {driver.reviews.map((review, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#a855f7", marginBottom: 4 }}>
                          {review.author}
                        </p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{review.text}</p>
                      </div>
                    ))}
                    <button
                      className="w-full mt-2 py-2.5 rounded-xl text-white font-bold active:scale-95 transition-transform"
                      style={{
                        background: "linear-gradient(135deg, #f97316, #a855f7)",
                        fontSize: 14,
                      }}
                    >
                      Выбрать водителя
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(10,10,15,0.92)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-around py-3 px-6">
          {[
            { icon: "MapPin", label: "Заказ", tab: "order" },
            { icon: "Clock", label: "История", tab: "history" },
            { icon: "Users", label: "Водители", tab: "drivers" },
            { icon: "User", label: "Профиль", tab: "profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.tab !== "profile" && setActiveTab(item.tab as "order" | "drivers" | "history")}
              className="flex flex-col items-center gap-1 transition-all duration-200"
              style={{ color: activeTab === item.tab ? "#f97316" : "rgba(255,255,255,0.28)" }}
            >
              <Icon name={item.icon as "MapPin" | "Clock" | "Users" | "User"} size={20} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}