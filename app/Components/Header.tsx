"use client";

import React from "react";
import { CartItem } from "../types";
import { FaRobot, FaRocket } from "react-icons/fa";

interface HeaderProps {
  cartItems: CartItem[];
}

const Header: React.FC<HeaderProps> = ({ cartItems }) => {
  const cartItemCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  return (
    <header className="sticky top-0 z-50 py-4 px-8">
      <div className="flex justify-between items-center backdrop-blur-md p-3 border border-white/20 rounded-2xl">
        <h1
          className="text-3xl font-bold text-white tracking-tight font-space-grotesk "
          style={{
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          <span className="bg-gradient-to-r from-white to-purple-300 bg-clip-text ">
            <span className="flex items-center gap-1">
              {/* <img
                src={logo}
                alt="DevKit.AI Logo"
                className="h-8 w-auto mr-2"
              /> */}
              <span className="text-purple-400 mr-2">
                <FaRocket /> {""}
              </span>
              DevKit.AI
              {/* <span className="text-white text-lg">
                - AI Shopping Assistant
              </span> */}
              <span role="img" aria-label="smiling face"></span>
            </span>
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span className="bg-purple-600/80 backdrop-blur-sm text-white rounded-full px-2 py-0.5 text-sm bg-green-600 ">
            {cartItemCount}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
