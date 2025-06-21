"use client";
import React, { useState, useCallback } from "react";
import { Tab } from "@headlessui/react";
import { MenuItem } from "../types";

interface CartItem extends MenuItem {
  quantity: number;
}

interface ShoppingContainerProps {
  cartItems: MenuItem[];
  setCartItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  addToCart: (item: MenuItem) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  menuItems: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  logo?: string;
  image?: string;
  description?: string;
}

const ShoppingContainer: React.FC<ShoppingContainerProps> = ({
  cartItems,
  setCartItems,
  addToCart,
  updateQuantity,
  menuItems,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category))
  );
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  // Generate random order ID and trigger checkout
  const handleCheckout = useCallback(() => {
    const newOrderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const event = new CustomEvent("handleCheckout", {
      detail: { orderId: newOrderId },
    });
    window.dispatchEvent(event);
  }, []);

  return (
    <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-xl p-6 w-full h-[80vh] flex flex-col overflow-hidden border border-white/20">
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-2 rounded-xl bg-black/5 p-1 mb-4 backdrop-blur-sm">
          <Tab
            className={({ selected }) =>
              `w-full rounded-xl py-2.5 text-sm font-medium leading-5 transition-all duration-200
             ${
               selected
                 ? "bg-white text-black shadow-md"
                 : "text-gray-600 hover:bg-white/50 hover:text-black"
             }`
            }
          >
            Shop
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-xl py-2.5 text-sm font-medium leading-5 transition-all duration-200
             ${
               selected
                 ? "bg-white text-black shadow-md"
                 : "text-gray-600 hover:bg-white/50 hover:text-black"
             }`
            }
          >
            Cart (
            {cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)})
          </Tab>
        </Tab.List>
        <Tab.Panels className="flex-1 overflow-hidden">
          {/* Shop Panel */}
          <Tab.Panel className="h-[70vh] overflow-y-auto">
            <div className="space-y-4 px-1 pb-4">
              {categories.map((category) => (
                <div key={category} className="mb-4">
                  <h3 className="font-bold text-lg mb-3 sticky top-0 backdrop-blur-md bg-black/70 py-2 px-3 rounded-lg z-10">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-black">
                    {menuItems
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between backdrop-blur-sm bg-white/40 p-4 rounded-lg hover:bg-white/50 transition-all duration-200 group border border-white/20"
                        >
                          <div className="flex gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl shadow-sm shrink-0">
                              {item.logo || item.image ? (
                                <img
                                  src={item.logo || item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              ) : (
                                item.emoji
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-black">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold">
                                  {item.name}
                                </span>
                                <span className="bg-black/5 px-2 py-0.5 rounded-full text-sm">
                                  ${item.price.toFixed(2)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4 shrink-0">
                            {cartItems.some(
                              (cartItem) => cartItem.id === item.id
                            ) ? (
                              <div className="flex items-center gap-1 bg-black/5 p-1 rounded-full">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      (cartItems.find(
                                        (cartItem) => cartItem.id === item.id
                                      )?.quantity || 1) - 1
                                    )
                                  }
                                  className="bg-white text-black w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-7 text-center font-medium">
                                  {cartItems.find(
                                    (cartItem) => cartItem.id === item.id
                                  )?.quantity || 0}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      (cartItems.find(
                                        (cartItem) => cartItem.id === item.id
                                      )?.quantity || 1) + 1
                                    )
                                  }
                                  className="bg-white text-black w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item)}
                                className="bg-black text-white px-4 py-1.5 rounded-full text-sm hover:bg-gray-800 transition-colors"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Tab.Panel>

          {/* Cart Panel */}
          <Tab.Panel className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="px-1">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <span className="text-4xl mb-2">🛒</span>
                    <p className="text-lg">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between backdrop-blur-sm bg-white/50 p-3 rounded-lg border border-white/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg shrink-0">
                            {item.logo || item.image ? (
                              <img
                                src={item.logo || item.image}
                                alt={item.name}
                                className="w-full h-full object-contain rounded-lg"
                              />
                            ) : (
                              item.emoji
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-full">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              setCartItems(
                                cartItems.filter(
                                  (cartItem) => cartItem.id !== item.id
                                )
                              )
                            }
                            className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Section - Fixed at bottom */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/20 bg-white/5 backdrop-blur-sm mt-auto">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-medium">Total</span>
                    <span className="text-lg font-bold">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    data-testid="checkout-button"
                    className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Checkout (${cartTotal.toFixed(2)})
                  </button>
                </div>
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ShoppingContainer;
