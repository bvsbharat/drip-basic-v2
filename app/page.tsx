"use client";
import { useState, useEffect } from "react";
import ShoppingContainer from "./components/ShoppingContainer";
import Header from "./components/Header";
import TavusClient from "./components/TavusClient";
import OrderReceipt from "./components/OrderReceipt"; // Import OrderReceipt component

import { MenuItem } from "./types";
import { updateCart } from "./utils/cartUtils";

interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  emoji: string;
  quantity?: number;
}

interface CartProps {
  transcription: string;
}

const menuItems: MenuItem[] = [
  // Dev Tools Tools
  {
    id: "1",
    name: "Windsurf",
    description:
      "Windsurf Editor is a modern, AI-powered integrated development environment (IDE) designed to streamline and enhance the coding process for developers of all experience levels. It is available on Windows, Mac, and Linux, and offers a range of advanced features that distinguish it from traditional code editors",
    price: 15,
    category: "Dev Tools",
    emoji: "🚀",
    image:
      "https://exafunction.github.io/public/brand/windsurf-black-symbol.svg",
  },
  {
    id: "12",
    name: "Basic.tech",
    description:
      "Basic is a purpose-built backend for personalization of apps and agents. We have a federated model instead of a traditional database, where we spin up a dedicated “datastore per user” in the cloud so each of your users is solely given their own db.",
    price: 0,
    category: "Dev Tools",
    emoji: "🚀",
    image: "https://basic.tech/_next/image?url=%2Flogo_dark.webp&w=64&q=75",
  },
  {
    id: "5",
    name: "Cursor",
    description:
      "AI-powered VS Code fork providing real-time code suggestions, documentation lookup, and debugging assistance.",
    price: 20,
    image:
      "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/cursor.png",
    category: "Dev Tools",
    emoji: "🖥️",
  },
  {
    id: "2",
    name: "GitHub Copilot",
    description:
      "AI-powered code completion tool providing context-aware suggestions across multiple languages. Best for general coding with broad language support.",
    price: 20,
    category: "Dev Tools",
    emoji: "🤖",
    image: "https://miro.medium.com/v2/resize:fit:700/0*oRRpMJ9XqkRnYLhW.png",
  },
  {
    id: "4",
    name: "Replit",
    description:
      "Cloud-based AI coding assistant with support for 50+ languages and instant deployment capabilities.",
    price: 15,
    category: "Dev Tools",
    emoji: "🌐",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/New_Replit_Logo.svg/1200px-New_Replit_Logo.svg.png",
  },

  {
    id: "3",
    name: "Tabnine",
    description:
      "AI-driven autocomplete tool offering context-aware code suggestions with emphasis on security and VPC hosting options.",
    price: 15,
    category: "Dev Tools",
    emoji: "⚡",
    image:
      "https://tabnine.gallerycdn.vsassets.io/extensions/tabnine/tabnine-vscode/3.232.0/1739096781018/Microsoft.VisualStudio.Services.Icons.Default",
  },
  {
    id: "6",
    name: "Devin",
    description:
      "Advanced AI coding agent capable of autonomously handling complex engineering tasks, debugging, and deploying applications.",
    price: 200,
    category: "Dev Tools",
    emoji: "🧠",
    image: "https://app.devin.ai/devin_v4.png",
  },

  // Developer Tools
  {
    id: "7",
    name: "IntelliJ IDEA",
    description:
      "Powerful Java IDE with smart code assistance and debugging capabilities.",
    price: 149,
    category: "Developer Tools",
    emoji: "💡",
    image: "https://banner2.cleanpng.com/20180713/pue/aawvv0uk4.webp",
  },
  {
    id: "8",
    name: "Visual Studio Code",
    description:
      "Lightweight and extensible code editor with vast plugin support.",
    price: 0,
    category: "Developer Tools",
    emoji: "📜",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/2048px-Visual_Studio_Code_1.35_icon.svg.png",
  },
  {
    id: "9",
    name: "Postman",
    description:
      "API development and testing platform with automated testing and monitoring capabilities.",
    price: 12,
    category: "Developer Tools",
    emoji: "🔗",
    image:
      "https://cdn.iconscout.com/icon/free/png-256/free-postman-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-company-brand-vol-5-pack-logos-icons-2945092.png?f=webp&w=256",
  },
  {
    id: "10",
    name: "Docker",
    description:
      "Containerization platform for packaging applications and dependencies.",
    price: 0,
    category: "Developer Tools",
    emoji: "🐳",
    image:
      "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/97_Docker_logo_logos-512.png",
  },
  {
    id: "11",
    name: "Jenkins",
    description:
      "Open-source automation server for CI/CD pipelines and automated deployment.",
    price: 0,
    category: "Developer Tools",
    emoji: "🔧",
  },
];

const App: React.FC = () => {
  const [transcription, setTranscription] = useState<string>("");
  const [liveMessages, setliveMessages] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Simulated real-time transcription updates
  useEffect(() => {
    const demoText = `Hello, My name is DevShoppii, your personal shopping AI agent. 
     I'm here to make your shopping experience smarter, faster, and easier.
     How can I assist you today?`;
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < demoText.length) {
        setTranscription(demoText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const processRealtimeVoiceOrder = (message: any) => {
    // Handle the voice order here, e.g., send it to a server or execute a function
    console.log("Voice message received:", message);
  };

  useEffect(() => {
    processRealtimeVoiceOrder(liveMessages);
  }, [liveMessages]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const suggestions = [
    { name: "Double Patty", price: "Free" },
    { name: "Veggie Patty", price: "Free" },
    { name: "Turkey Patty", price: "Free" },
    { name: "Crispy Chicken", price: "Free" },
    { name: "Grilled Chicken", price: "Free" },
  ];

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const handleCheckout = () => {
    // Generate a random order ID
    const newOrderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    setOrderId(newOrderId);
    setShowReceipt(true);

    console.log("Order ID:", newOrderId);
  };

  useEffect(() => {
    const handleCheckoutEvent = (event: CustomEvent) => {
      setOrderId(event.detail.orderId);
      setShowReceipt(true);
    };

    window.addEventListener(
      "handleCheckout",
      handleCheckoutEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "handleCheckout",
        handleCheckoutEvent as EventListener
      );
    };
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col page-container backdrop-blur-md"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1604328698692-f76ea9498e76?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header with glass effect */}
      <Header cartItems={cartItems} />

      <div className="flex-1 flex justify-center items-start p-4">
        <div
          className="container mx-auto max-w-7xl flex items-stretch gap-6 
        "
        >
          {/* Left side - Avatar and Transcription */}
          <div
            className="flex-1 flex flex-col justify-between h-[80vh] relative overflow-hidden rounded-2xl"
            style={{
              backgroundImage: "url('/bg_final.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 w-full h-full flex justify-center items-center">
                <TavusClient
                  replicaId="rca8a38779a8"
                  personaId="p1458b007004"
                  agentId="36f51890-f91e-40e5-befb-47562737e8b9"
                  onStart={() => console.log("SimliVapi started")}
                  onClose={() => console.log("SimliVapi closed")}
                  showDottedFace={false}
                  onMessageReceived={(message) => {
                    console.log(message);
                    setTranscription(message.data.text);
                  }}
                  menuItems={menuItems}
                  currentCart={cartItems}
                  setCurrentCart={setCartItems}
                  onCartUpdate={(updates) => {
                    console.log("Voice agent cart updates:", updates);
                    setCartItems(updates);

                    // Check if the update indicates a checkout action
                    const isCheckout = updates.some(
                      (item: any) => item.action === "checkout"
                    );

                    if (isCheckout) {
                      setShowReceipt(true);
                      // Generate a simple order ID for demonstration
                      setOrderId(`ORD-${Date.now()}`);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right side - Cart */}
          <div className="w-[600px]">
            <ShoppingContainer
              cartItems={cartItems}
              setCartItems={setCartItems}
              addToCart={addToCart}
              updateQuantity={updateQuantity}
              menuItems={menuItems}
            />

            <div className="mt-4 px-4 h-[60px]">
              {cartItems.length > 0 ? (
                <label
                  className="inline-block w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 font-semibold text-center border-2 border-dashed border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={handleCheckout}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCheckout();
                    }
                  }}
                >
                  Total Amount: (${total.toFixed(2)})
                </label>
              ) : (
                <div className="w-full"></div>
              )}
            </div>

            {/* Order Receipt Modal - Moved here */}
            {showReceipt && (
              <OrderReceipt
                isOpen={showReceipt}
                onClose={() => {
                  setShowReceipt(false);
                  setCartItems([]);
                }}
                orderId={orderId}
                cartItems={cartItems}
                total={total}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
