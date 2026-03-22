import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

interface NewsChannel {
  id: string;
  name: string;
  shortName: string;
  youtubeId: string;
  category: "financial" | "world" | "crypto" | "tech";
  description: string;
  logo: string;
  isLive: boolean;
}

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

const NEWS_CHANNELS: NewsChannel[] = [
  {
    id: "bloomberg",
    name: "Bloomberg Television",
    shortName: "Bloomberg",
    youtubeId: "dp8PhLsUcFE",
    category: "financial",
    description: "Global business, finance & market news",
    logo: "B",
    isLive: true,
  },
  {
    id: "cnbc",
    name: "CNBC Television",
    shortName: "CNBC",
    youtubeId: "9NyxcX3rhQs",
    category: "financial",
    description: "US business news & stock market coverage",
    logo: "C",
    isLive: true,
  },
  {
    id: "yahoo-finance",
    name: "Yahoo Finance",
    shortName: "Yahoo Fin",
    youtubeId: "fulSO4MyCeA",
    category: "financial",
    description: "Market analysis & financial commentary",
    logo: "Y",
    isLive: true,
  },
  {
    id: "aljazeera",
    name: "Al Jazeera English",
    shortName: "Al Jazeera",
    youtubeId: "gCNeDWCI0vo",
    category: "world",
    description: "International news & current affairs",
    logo: "AJ",
    isLive: true,
  },
  {
    id: "fox-business",
    name: "Fox Business",
    shortName: "Fox Biz",
    youtubeId: "UGhiwyFCSAY",
    category: "financial",
    description: "Business news & economic analysis",
    logo: "FB",
    isLive: true,
  },
  {
    id: "cnn",
    name: "CNN International",
    shortName: "CNN",
    youtubeId: "oJUvTVdTMyY",
    category: "world",
    description: "Breaking news & world events",
    logo: "CN",
    isLive: true,
  },
  {
    id: "sky-news",
    name: "Sky News",
    shortName: "Sky",
    youtubeId: "9Auq9mYxFEE",
    category: "world",
    description: "UK & international breaking news",
    logo: "SK",
    isLive: true,
  },
  {
    id: "coindesk",
    name: "CoinDesk TV",
    shortName: "CoinDesk",
    youtubeId: "EoTCmGKXSBo",
    category: "crypto",
    description: "Cryptocurrency news & blockchain coverage",
    logo: "CD",
    isLive: true,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Channels",
  financial: "Financial",
  world: "World News",
  crypto: "Crypto",
  tech: "Technology",
};

const CATEGORY_COLORS: Record<string, string> = {
  financial: "#10b981",
  world: "#3b82f6",
  crypto: "#f59e0b",
  tech: "#8b5cf6",
};

function ChannelButton({
  channel,
  isActive,
  onClick,
}: {
  channel: NewsChannel;
  isActive: boolean;
  onClick: () => void;
}) {
  const catColor = CATEGORY_COLORS[channel.category] || "#6b7280";
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        borderRadius: "10px",
        border: isActive ? `2px solid ${catColor}` : "2px solid transparent",
        background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        width: "100%",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: isActive ? catColor : "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 12,
          color: isActive ? "#000" : "#9ca3af",
          flexShrink: 0,
          transition: "all 0.2s ease",
        }}
      >
        {channel.logo}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: isActive ? "#fff" : "#d1d5db",
            fontWeight: isActive ? 600 : 400,
            fontSize: 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {channel.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#6b7280",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {channel.description}
        </div>
      </div>
      {channel.isLive && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#ef4444",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>LIVE</span>
        </div>
      )}
    </button>
  );
}

function MarketTicker() {
  const [prices, setPrices] = useState<any>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/crypto/prices");
        if (res.ok) {
          const data = await res.json();
          setPrices(data.slice(0, 8));
        }
      } catch {}
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!prices) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "10px 16px",
        background: "rgba(0,0,0,0.3)",
        borderRadius: "10px",
        overflowX: "auto",
        whiteSpace: "nowrap",
        fontSize: 12,
      }}
    >
      {prices.map((coin: any) => (
        <div key={coin.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img
            src={coin.image}
            alt={coin.symbol}
            style={{ width: 16, height: 16, borderRadius: 4 }}
          />
          <span style={{ color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>
            {coin.symbol}
          </span>
          <span style={{ color: "#fff", fontWeight: 500 }}>
            ${coin.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span
            style={{
              color: (coin.price_change_percentage_24h || 0) >= 0 ? "#10b981" : "#ef4444",
              fontWeight: 600,
            }}
          >
            {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
            {(coin.price_change_percentage_24h || 0).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function NewsHub() {
  const [activeChannel, setActiveChannel] = useState<NewsChannel>(NEWS_CHANNELS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const filteredChannels =
    categoryFilter === "all"
      ? NEWS_CHANNELS
      : NEWS_CHANNELS.filter((ch) => ch.category === categoryFilter);

  const switchChannel = useCallback(
    (channel: NewsChannel) => {
      setActiveChannel(channel);
      if (isMobile) setShowChannelList(false);
    },
    [isMobile]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0f 0%, #111827 50%, #0a0a0f 100%)",
        color: "#e5e7eb",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .news-scrollbar::-webkit-scrollbar { width: 4px; }
        .news-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .news-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>

      <Navigation />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "16px" : "24px 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #ef4444, #f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              📺
            </div>
            <div>
              <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "#fff", margin: 0 }}>
                News Hub
              </h1>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                Live financial news & market coverage • Powered by Simpleton™
              </p>
            </div>
          </div>
        </div>

        {/* Market Ticker */}
        <div style={{ marginBottom: 20 }}>
          <MarketTicker />
        </div>

        {/* Category Filter */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "none",
                background:
                  categoryFilter === key ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                color: categoryFilter === key ? "#fff" : "#9ca3af",
                fontSize: 12,
                fontWeight: categoryFilter === key ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div style={{ display: "flex", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
          {/* Video Player */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                borderRadius: 14,
                overflow: "hidden",
                background: "#000",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <iframe
                key={activeChannel.youtubeId}
                src={`https://www.youtube.com/embed/${activeChannel.youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeChannel.name}
              />
            </div>

            {/* Now Playing Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: CATEGORY_COLORS[activeChannel.category] || "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#000",
                  }}
                >
                  {activeChannel.logo}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
                    {activeChannel.name}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>
                    {activeChannel.description}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {activeChannel.isLive && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(239,68,68,0.15)",
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#ef4444",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 12 }}>
                      LIVE NOW
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Channel Toggle */}
            {isMobile && (
              <button
                onClick={() => setShowChannelList(!showChannelList)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {showChannelList ? "▲ Hide Channels" : "▼ Browse Channels (" + filteredChannels.length + ")"}
              </button>
            )}
          </div>

          {/* Channel Sidebar */}
          {(!isMobile || showChannelList) && (
            <div
              className="news-scrollbar"
              style={{
                width: isMobile ? "100%" : 300,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: isMobile ? 400 : 600,
                overflowY: "auto",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 14,
                padding: 10,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  padding: "6px 8px",
                }}
              >
                Channels ({filteredChannels.length})
              </div>
              {filteredChannels.map((channel) => (
                <ChannelButton
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel.id === channel.id}
                  onClick={() => switchChannel(channel)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Switch Bar */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 20,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            overflowX: "auto",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              paddingRight: 8,
            }}
          >
            Quick Switch:
          </span>
          {NEWS_CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => switchChannel(ch)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                background:
                  activeChannel.id === ch.id
                    ? CATEGORY_COLORS[ch.category] || "#6b7280"
                    : "rgba(255,255,255,0.06)",
                color: activeChannel.id === ch.id ? "#000" : "#9ca3af",
                fontSize: 11,
                fontWeight: activeChannel.id === ch.id ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {ch.shortName}
            </button>
          ))}
        </div>

        {/* Info Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 16,
            marginTop: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              padding: 20,
              background: "rgba(16,185,129,0.08)",
              borderRadius: 14,
              border: "1px solid rgba(16,185,129,0.15)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#10b981", marginBottom: 6 }}>
              📈 Financial Markets
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
              Real-time coverage from Bloomberg, CNBC, Fox Business, and Yahoo Finance. Track
              market movements as they happen.
            </div>
          </div>
          <div
            style={{
              padding: 20,
              background: "rgba(59,130,246,0.08)",
              borderRadius: 14,
              border: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#3b82f6", marginBottom: 6 }}>
              🌍 World News
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
              Global perspective from Al Jazeera, CNN, and Sky News. Stay informed on events that
              move markets worldwide.
            </div>
          </div>
          <div
            style={{
              padding: 20,
              background: "rgba(245,158,11,0.08)",
              borderRadius: 14,
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", marginBottom: 6 }}>
              🪙 Crypto Coverage
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
              Cryptocurrency and blockchain news from CoinDesk. Monitor the digital asset space
              with expert analysis.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
