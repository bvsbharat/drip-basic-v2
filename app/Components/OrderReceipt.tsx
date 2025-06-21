import React, { useState, useEffect } from "react";
import { CartItem } from "../types";
import Image from "next/image";
import ReactConfetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface OrderReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  orderId: string;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({
  isOpen,
  onClose,
  cartItems,
  total,
  orderId,
}) => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Set initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isOpen) return null;

  const grandTotal = total;
  const currentDate = new Date().toLocaleDateString();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      >
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Decorative top border */}
          <div className="w-full h-3 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>

          {/* Header with logo and order number */}
          <div className="p-8 text-center">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex flex-col items-center justify-center gap-4"
            >
              <div className="w-16 h-16">
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-orange-500"
                >
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-lg mb-2">
                  Order No: {orderId}
                </p>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Thank you for your order!
                </h1>
                <p className="text-gray-600">
                  A confirmation email will be sent shortly.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Order Details */}
          <div className="px-8 pb-8">
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                        {item.emoji}
                      </span>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-orange-600">
                    ${((item.quantity || 1) * item.price).toFixed(2)}
                  </p>
                </motion.div>
              ))}

              {/* Order Summary */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 space-y-2 border-t pt-4"
              >
                <div className="flex justify-between text-gray-600">
                  <p>Subtotal</p>
                  <p>${total.toFixed(2)}</p>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed">
                  <p>Total</p>
                  <p className="text-orange-600">${grandTotal.toFixed(2)}</p>
                </div>
              </motion.div>

              {/* Close button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                >
                  Close
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderReceipt;
