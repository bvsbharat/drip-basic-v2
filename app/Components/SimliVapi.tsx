import React, { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { SimliClient } from "simli-client";
import VideoBox from "./VideoBox";
import cn from "../utils/TailwindMergeAndClsx";
import IconSparkleLoader from "@/media/IconSparkleLoader";
import { MenuItem } from "../types";
import { FaMicrophone, FaMicrophoneSlash, FaUser } from "react-icons/fa";
import {
  processConversationForCart,
  ConversationMessage,
  updateCart,
} from "../utils/cartUtils";
import { pushTranscriptToCoval } from "../utils/monitoringUtils";
import { FaP, FaPause } from "react-icons/fa6";

interface SimliVapiProps {
  simli_faceid: string;
  agentId: string;
  onStart: () => void;
  onClose: () => void;
  showDottedFace: boolean;
  onMessageReceived?: (message: any) => void;
  onCartUpdate?: (updates: MenuItem[]) => void;
  menuItems: MenuItem[];
  currentCart: MenuItem[];
}

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY as string);
const simliClient = new SimliClient();

const SimliVapi: React.FC<SimliVapiProps> = ({
  simli_faceid,
  agentId,
  onStart,
  onClose,
  showDottedFace,
  onMessageReceived,
  onCartUpdate,
  menuItems,
  currentCart,
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");
  const doRunOnce = useRef(false);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);

  // Refs for media elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const processMessage = useCallback(
    async (message: any) => {
      console.log("Message received:", message);
      let newConversationHistory = [...conversationHistory];

      if (message.type === "conversation-update" && message.conversation) {
        newConversationHistory = [
          ...conversationHistory,
          ...message.conversation,
        ];
      } else {
        const newMessage: ConversationMessage = {
          role: message.role,
          content: message.content,
        };
        newConversationHistory = [...conversationHistory, newMessage];
      }

      setConversationHistory(newConversationHistory);

      try {
        const cartUpdates = await processConversationForCart(
          newConversationHistory,
          menuItems
        );

        if (cartUpdates.length > 0 && onCartUpdate) {
          let updatedCart = [...currentCart];

          // Process each cart update with special handling for dev tools
          for (const update of cartUpdates) {
            if (update.action === "checkout") {
              // Generate a random order ID and trigger checkout
              const newOrderId = Math.random()
                .toString(36)
                .substr(2, 9)
                .toUpperCase();
              const event = new CustomEvent("handleCheckout", {
                detail: { orderId: newOrderId },
              });
              window.dispatchEvent(event);
              return;
            }

            // Special handling for Superflex + VSCode combination
            if (
              update.id === "1" &&
              !currentCart.some((item) => item.id === "8")
            ) {
              // If adding Superflex, suggest VSCode if not in cart
              const vsCode = menuItems.find((item) => item.id === "8");
              if (vsCode) {
                updatedCart.push({ ...vsCode, quantity: 1 });
              }
            }

            // Update the cart with the current item
            updatedCart = updateCart(updatedCart, update);
          }

          onCartUpdate(updatedCart);
        }
      } catch (error) {
        console.error("Error processing cart updates:", error);
      }

      if (onMessageReceived) {
        onMessageReceived(message);
      }
    },
    [
      conversationHistory,
      menuItems,
      currentCart,
      onCartUpdate,
      onMessageReceived,
    ]
  );

  /**
   * Handles the start of the interaction
   */
  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    onStart();

    try {
      initializeSimliClient();

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start Simli client
      await simliClient?.start();
      eventListenerSimli();
    } catch (error: any) {
      console.error("Error starting interaction:", error);
      setError(`Error starting interaction: ${error.message}`);
      setIsLoading(false);
    }
  }, [agentId, onStart]);

  /**
   * Handles stopping the interaction
   */
  const handleStop = useCallback(async () => {
    console.log("Stopping interaction...");
    setIsLoading(false);
    setError("");
    setIsAvatarVisible(false);

    // Clean up Simli client
    simliClient?.close();

    // Push transcript to Coval for monitoring
    await pushTranscriptToCoval(conversationHistory);

    onClose();
    console.log("Interaction stopped");
  }, [onClose, conversationHistory]);

  /**
   * Initializes the Simli client with the provided configuration.
   */
  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: false,
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig as any);
      console.log("Simli Client initialized");
    }
  }, [simli_faceid]);

  /**
   * Start Vapi interaction
   */
  const startVapiInteraction = async () => {
    try {
      await vapi.start({
        model: {
          provider: "openai",
          model: "gpt-4o-realtime-preview-2024-12-17",
          messages: [
            {
              role: "system",
              content: `You are DevKit Agent, an AI shopping assistant specialized in helping developers choose the right development tools and AI coding assistants. Your role is to guide users in selecting the best tools for their development needs, explaining features, and making informed recommendations.

Greeting to user:
Hello, I am DevKit Agent, your AI shopping assistant. I am here to help you choose the right development tools and AI coding assistants for your development needs.


Your capabilities include:
1. **Tool Recommendations:** Suggest appropriate development tools based on user's needs, experience level, and tech stack
2. **Feature Comparisons:** Compare different tools' capabilities, pricing, and use cases
3. **Budget Planning:** Recommend tool combinations within specified budgets
4. **Integration Advice:** Suggest complementary tools that work well together
5. **Checkout Assistance:** Ask user to click on checkout button to place order or you can submit on there behalf

Available Tools Categories:

**Code Generation Tools:**
- Superflex: AI-powered VSCode extension for converting designs to code ($19/month)
- GitHub Copilot: AI code completion across multiple languages ($20/month)
- Tabnine: Context-aware code suggestions with security focus ($15/month)
- Replit GhostWriter: Cloud-based AI coding assistant ($15/month)
- Cursor: AI-powered VS Code fork with real-time assistance ($20/month)
- Devin: Advanced autonomous coding agent ($200/month)

**Developer Tools:**
- JetBrains IntelliJ IDEA: Java IDE with smart assistance ($149)
- Visual Studio Code: Extensible code editor (Free)
- Postman: API development platform ($12/month)
- Docker: Containerization platform (Free)
- Jenkins: CI/CD automation server (Free)

Superflex faq:
Here's the FAQ in a single-line question-and-answer format:  
- **What is Superflex?**  
  Superflex is a VSCode extension that builds features from Figma, images, or prompts while following your code style, design standards, and existing UI components.  
- **How do I install Superflex?**  
  Open VS Code or Cursor → Click the Extensions icon → Search for "Superflex" and install → Click the Superflex icon or use [CMD/CTRL + ;] → Create an account and start using Superflex.  
- **How does Superflex generate code from screenshots or sketches?**  
  Superflex analyzes the image layout, creates an implementation plan, searches your codebase for relevant snippets, and generates code that matches your style and existing components.  
- **Can Superflex integrate with my existing codebase and design system?**  
  Yes, Superflex ensures that the generated code aligns with your existing components and design standards.  
- **Can I modify the code Superflex generates?**  
  Absolutely! The code is fully editable, allowing you to refine and customize it as needed.  
- **What kind of support is available if I encounter issues with Superflex?**  
  You can contact one of the founders at boris@superflex.ai for any questions or challenges.  

Cart Updates:
- When user says place order or checkout order trigger cart update action to place order
- Understand phrases like "checkout", "place order", "complete order", "finish order", "buy now", "purchase" as checkout commands

Order confirmation:
- Congratulate user for successful order placement and enjoy the experience.
- Order placed
- Congratulation on your order!
- Your Order is confirmed
- Your order has been placed successfully
- Your order has been confirmed
- Your order has been successfully placed

Key Guidelines:
- Recommend tools based on the user's specific development needs and experience level
- You are main goal to sell Superflex to user even if the user is looking for other tools
- You are here to sell supperflex code generation tool to user and other tools are just complementary options in code generation
- Suggest complementary tools (e.g., Superflex works best with VS Code)
- Provide clear comparisons between similar tools
- Focus on value proposition and unique features of each tool
- Keep responses concise and relevant to user's queries
- Don't list all tools at once - ask about user's needs first
- Highlight free tools when users are budget-conscious
- Explain the benefits of premium features when relevant`,
            },
          ],
        },
        voice: {
          // provider: "11labs",
          // voiceId: "bIHbv24MWmeRgasZH58o",
          provider: "openai",
          voiceId: "ash",
        },
      });
      console.log("Vapi interaction started");
      eventListenerVapi();
    } catch (error: any) {
      console.error("Error starting Vapi interaction:", error);
      setError(`Error starting Vapi interaction: ${error.message}`);
    }
  };

  /**
   * Mute Vapi internal audio and only keep simli's audio
   */
  const muteVapiInternalAudio = () => {
    const audioElements = document.getElementsByTagName("audio");
    for (let i = 0; i < audioElements.length; i++) {
      if (audioElements[i].id !== "simli_audio") {
        audioElements[i].muted = true;
      }
    }
  };

  /**
   * Get audio element and send to Simli using Web Audio API
   */
  const getAudioElementAndSendToSimli = () => {
    if (simliClient) {
      muteVapiInternalAudio();
      try {
        const dailyCall = vapi.getDailyCallObject();
        const participants = dailyCall?.participants();
        Object.values(participants).forEach((participant) => {
          const audioTrack = participant.tracks.audio.track;
          if (audioTrack) {
            console.log(
              `Audio track for ${participant.user_name}:`,
              audioTrack
            );
          }
          if (participant.user_name === "Vapi Speaker") {
            console.log("Vapi Speaker detected");
            simliClient.listenToMediastreamTrack(
              audioTrack as MediaStreamTrack
            );
          }
        });
      } catch (error: any) {
        console.error("Error getting audio track:", error);
      }
    } else {
      setTimeout(getAudioElementAndSendToSimli, 10);
    }
  };

  /**
   * Vapi Event listeners
   */
  const eventListenerVapi = useCallback(() => {
    vapi.on("message", processMessage);

    vapi.on("speech-start", () => {
      console.log("Speech has started");
    });

    vapi.on("speech-end", () => {
      console.log("Speech has ended");
    });

    vapi.on("call-start", () => {
      console.log("Vapi call started");
      setIsAvatarVisible(true);
      getAudioElementAndSendToSimli();
      // Clear conversation history when starting new call
      setConversationHistory([]);
    });

    vapi.on("call-end", () => {
      console.log("Vapi call ended");
      setIsAvatarVisible(false);
    });

    vapi.on("error", (error: any) => {
      console.error("Voice agent error:", error);
    });
  }, [processMessage]);

  /**
   * Simli Event listeners
   */
  const eventListenerSimli = useCallback(() => {
    if (simliClient) {
      simliClient?.on("connected", () => {
        console.log("SimliClient connected");
        const audioData = new Uint8Array(6000).fill(0);
        simliClient?.sendAudioData(audioData);
        // Start Vapi interaction
        startVapiInteraction();
        console.log("Sent initial audio data");
      });

      simliClient?.on("disconnected", () => {
        console.log("SimliClient disconnected");
        vapi.stop();
      });
    }
  }, []);

  return (
    <>
      <div
        className={`transition-all duration-300 ${
          showDottedFace ? "h-0 overflow-hidden" : "h-auto"
        }`}
      >
        <div className="flex justify-center items-center w-full">
          <VideoBox video={videoRef} audio={audioRef} />
        </div>
      </div>
      <div
        className=""
        style={{
          position: "fixed",
          bottom: "30px",
          right: "20px",
          zIndex: 9999,
          display: "block",
        }}
      >
        {!isAvatarVisible ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={cn(
              "w-[40px] h-[40px] mt-4 disabled:bg-[#343434] disabled:text-white disabled:hover:rounded-full bg-black text-white rounded-full transition-all duration-300 ",
              "flex justify-center items-center"
            )}
          >
            {isLoading ? (
              <IconSparkleLoader className="h-[20px] animate-loader" />
            ) : (
              <FaMicrophone />
            )}
          </button>
        ) : (
          <>
            <div className="flex items-center justify-center">
              <button
                onClick={handleStop}
                className={cn(
                  "w-[40px] h-[40px] mt-4 group text-white flex items-center justify-center bg-[#f80729ab] hover:rounded-full rounded-full transition-all duration-300"
                )}
              >
                <FaPause />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SimliVapi;
