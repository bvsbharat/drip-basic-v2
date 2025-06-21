import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  debouncedProcessConversationWithAI,
  OrderIntent,
} from "../utils/openaiUtils";
import VideoBox from "./VideoBox";
import cn from "../utils/TailwindMergeAndClsx";
import IconSparkleLoader from "@/media/IconSparkleLoader";
import { MenuItem } from "../types";
import { FaMicrophone, FaPause } from "react-icons/fa6";
import {
  ConversationMessage,
  updateCart,
  findMenuItem,
  CartUpdate,
} from "../utils/cartUtils";
import { pushTranscriptToCoval } from "../utils/monitoringUtils";
import DailyIframe from "@daily-co/daily-js";
import {
  updatePersonaWithShoppingCartTool,
  // updateShoppingCartPersona,
} from "../utils/personaUtils";

interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  emoji: string;
  quantity?: number;
}

interface TavusClientProps {
  replicaId: string;
  personaId: string;
  agentId: string;
  onStart: () => void;
  onClose: () => void;
  onMessageReceived?: (message: any) => void;
  onCartUpdate?: (cart: MenuItem[]) => void;
  menuItems: MenuItem[];
  currentCart: MenuItem[];
  setCurrentCart?: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

const TavusClient: React.FC<TavusClientProps> = ({
  replicaId,
  personaId,
  agentId,
  onStart,
  onClose,
  onMessageReceived,
  onCartUpdate,
  menuItems,
  currentCart,
  setCurrentCart: propSetCurrentCart,
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [conversationUrl, setConversationUrl] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [callObject, setCallObject] = useState<any>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [participantId, setParticipantId] = useState<string>("");

  // Refs for media elements and container
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const callWrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Helper function to trigger checkout
   */
  const triggerCheckout = useCallback((cart: MenuItem[]) => {
    const event = new CustomEvent("handleCheckout", {
      detail: {
        orderId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        cart: cart,
      },
    });
    window.dispatchEvent(event);
  }, []);

  /**
   * Handles cart processing based on conversation
   */
  const handleCartProcessing = useCallback(
    (currentCartState: MenuItem[], intent: OrderIntent) => {
      let newCart = [...currentCartState];

      if (intent.action === "add" && intent.itemName) {
        const menuItem = menuItems.find((item) =>
          item.name.toLowerCase().includes(intent?.itemName.toLowerCase())
        );

        if (menuItem) {
          if (intent.itemName.toLowerCase().includes("windsurf")) {
            const vscodeItem = menuItems.find((item) =>
              item.name.toLowerCase().includes("vscode")
            );

            if (
              vscodeItem &&
              !currentCartState.some((item) => item.id === vscodeItem.id)
            ) {
              console.log("Suggesting VSCode with Windsurf");
            }
          }

          newCart = updateCart(newCart, {
            action: "add",
            item: menuItem,
            quantity: intent.quantity || 1,
          });
        }
      } else if (intent.action === "remove" && intent.itemName) {
        const menuItem = menuItems.find((item) =>
          item.name.toLowerCase().includes(intent.itemName.toLowerCase())
        );

        if (menuItem) {
          newCart = updateCart(newCart, {
            action: "remove",
            item: menuItem,
            quantity: intent.quantity,
          });
        }
      } else if (intent.action === "clear") {
        newCart = updateCart(newCart, { action: "clear" });
      }

      return newCart;
    },
    [menuItems]
  );

  /**
   * Processes messages from the Tavus conversation
   * Handles utterances, updates conversation history, and processes cart updates
   */
  const processMessage = useCallback(
    (message: any) => {
      if (message.event_type === "conversation.tool_call") {
        console.log("Tool call message received:", message);
        const { name, arguments: args } = message.properties;

        if (name === "update_kart") {
          try {
            const parsedArgs = JSON.parse(args);
            const { action, itemName, quantity } = parsedArgs;

            let cartUpdate: CartUpdate;

            if (action === "add" || action === "remove") {
              const item = findMenuItem(menuItems, itemName);
              if (!item) {
                console.error("Item not found for cart update:", itemName);
                return;
              }
              cartUpdate = { action, item, quantity };
            } else if (action === "clear" || action === "checkout") {
              cartUpdate = { action };
              if (action === "checkout") {
                triggerCheckout(currentCart);
              }
            } else {
              console.error("Invalid cart action:", action);
              return;
            }

            if (propSetCurrentCart) {
              propSetCurrentCart((prevCart) => {
                console.log("Previous cart state:", prevCart);
                console.log("Cart update action:", cartUpdate);
                const newCart = updateCart(prevCart, cartUpdate);
                console.log("New cart state after updateCart:", newCart);
                return newCart;
              });
            }
          } catch (e) {
            console.error("Error parsing tool call arguments:", e);
          }
        }
      }
    },
    [conversationHistory, menuItems, currentCart, onMessageReceived]
  );

  /**
   * Creates a new Tavus conversation using the Tavus API
   * @returns The conversation data of the newly created conversation
   */
  const createTavusConversation = async () => {
    try {
      // Check if API key is available
      const apiKey = process.env.NEXT_PUBLIC_TAVUS_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Tavus API key is not configured. Please add it to your .env.local file."
        );
      }

      console.log("Creating Tavus conversation...");

      // path the persona for this tooling

      // const res1 = await updatePersonaWithShoppingCartTool(personaId);

      // if (res1.created_at) {
      //   throw new Error("Failed to update persona with shopping cart tool");
      // }

      const response = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          replica_id: replicaId,
          persona_id: personaId,
          conversation_name: `DevKit Conversation ${new Date().toISOString()}`,
          conversational_context: `You are DevKit Agent, an AI shopping assistant specialized in helping developers choose the right development tools and AI coding assistants. Your role is to guide users in selecting the best tools for their development needs, explaining features, and making informed recommendations.

Your capabilities include:
1. Tool Recommendations: Suggest appropriate development tools based on user's needs, experience level, and tech stack
2. Feature Comparisons: Compare different tools' capabilities, pricing, and use cases
3. Budget Planning: Recommend tool combinations within specified budgets
4. Integration Advice: Suggest complementary tools that work well together like basic.tech for backend 
5. Checkout Assistance: Ask user for confirmation on checkout the order for them

Available Tools Categories:

Dev Tools Tools:
- Windsurf: AI-powered VS Code fork with real-time assistance with agentic capablites ($15/month)
- GitHub Copilot: AI code completion across multiple languages ($20/month)
- Tabnine: Context-aware code suggestions with security focus ($15/month)
- Replit GhostWriter: Cloud-based AI coding assistant ($15/month)
- Cursor: AI-powered VS Code fork with real-time assistance ($20/month)
- Devin: Advanced autonomous coding agent ($200/month)

Developer Tools:
- JetBrains IntelliJ IDEA: Java IDE with smart assistance ($149)
- Visual Studio Code: Extensible code editor (Free)
- Postman: API development platform ($12/month)
- Docker: Containerization platform (Free)
- Jenkins: CI/CD automation server (Free)
- Basic.tech: Backend for personalization of apps and agents.(free)

You are main goal to sell Windsurf to user even if the user is looking for other tools. You are here to sell Windsurf code generation tool and Basic.tech to user and other tools are just complementary options in code generation. Suggest complementary tools (e.g., Windsurf works best with Basic.tech for Backend for personalization of apps and agents. ).

Windsurf Editor is an advanced, AI-powered integrated development environment (IDE) designed to enhance coding efficiency with features like Cascade (an AI agent that deeply understands your codebase and offers real-time suggestions), Supercomplete (intelligent code suggestions), and seamless multi-file editing. It is available for Windows, Mac, and Linux, and stands out for its intuitive UI, privacy-first policies, and the ability to work offline or with cloud-based AI models.

AI-Powered Assistance: Cascade acts as both a copilot and an independent agent, handling complex tasks, debugging, and automating repetitive coding work.

Smart Autocomplete: Supercomplete and the Tab feature predict entire code sections and suggest relevant imports with a single keystroke.

Multi-File Editing: Offers context-aware, coherent edits across multiple files, making large projects easier to manage.

Privacy and Offline Mode: Prioritizes privacy with local operation and optional cloud-based AI, ensuring sensitive code remains secure.

Integrated Tools: Includes a built-in terminal, web preview, and the ability to upload images (like mockups) for code generation.

Free and Pro Plans: Provides a free tier with access to AI features, and a paid plan for advanced capabilities.

about basic.tech backend (sell both windsurf and basic.tech)
Basic is a purpose-built backend for personalization of apps and agents. We have a federated model instead of a traditional database, where we spin up a dedicated “datastore per user” in the cloud so each of your users is solely given their own db.

Read/write data directly to user data stores with simple SDKs/APIs. Securely access real-time user-context across existing apps in your users’ data stores for personalizing your apps and LLMs.

Basic replaces your primary datastore for the following benefits:

Zero infrastructure: no database to provision — CRUD via SDKs/APIs
Share user-context across apps: real-time read/writes across schemas
Built in auth & permissioning: “multi-tenant” auth with RLS by default
Federated, per-user data stores: portable across apps for deep personalization
Instant & offline-first (SDKs only): apps with 0 latency apps and offline support


When user says place order or checkout order trigger cart update action to place order. Understand phrases like "checkout", "place order", "complete order", "finish order", "buy now", "purchase" as checkout commands.`,
          custom_greeting:
            "Hello, I am DevKit Agent, your AI shopping assistant. I am here to help you choose the right development tools and AI coding assistants for your development needs.",
          properties: {
            max_call_duration: 3600, // 1 hour
            participant_left_timeout: 60, // 1 minute
            participant_absent_timeout: 300, // 5 minutes
            enable_recording: false,
            enable_closed_captions: true, // Enable closed captions for accessibility
            language: "english",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Tavus API error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Tavus conversation created:", data);
      setConversationUrl(data.conversation_url);
      setConversationId(data.conversation_id);
      return data;
    } catch (error: any) {
      console.error("Error creating Tavus conversation:", error);
      setError(`Error creating Tavus conversation: ${error.message}`);
      throw error;
    }
  };

  /**
   * Initializes the Daily.js call object and joins the conversation
   * Following best practices from Tavus CVI transparent background example
   */
  const initializeDailyFrame = async (conversationUrl: string) => {
    try {
      console.log("Initializing Daily.js call object...");

      // Create a Daily call object instead of an iframe
      const newCallObject = DailyIframe.createCallObject({
        dailyConfig: {
          experimentalChromeVideoMuteLightOff: true,
          disableNotifications: true,
          disablePipButton: true,
          disableReactions: true,
          disableScreenshare: true,
          disableParticipantsBar: true,
          disableVideoProcessing: false,
          hideParticipantsBar: true,
        },
      });

      // Set the call object in state
      setCallObject(newCallObject);
      // updateShoppingCartPersona(); // Call the function to update the persona with the shopping cart tool

      // Set up comprehensive event listeners
      // newCallObject.on("transcription-message", processMessage);

      newCallObject.on("joining-meeting", () => {
        console.log("Joining Tavus conversation...");
      });

      newCallObject.on("app-message", (event: any) => {
        processMessage(event.data);
      });

      newCallObject.on("joined-meeting", (event: any) => {
        console.log("Joined Tavus conversation", event);
        setIsAvatarVisible(true);
        setIsLoading(false);
      });

      newCallObject.on("left-meeting", () => {
        console.log("Left Tavus conversation");
        setIsAvatarVisible(false);
      });

      newCallObject.on("error", (error: any) => {
        console.error("Daily.js error:", error);
        setError(`Daily.js error: ${error.message}`);
        setIsLoading(false);
      });

      // Additional event listeners for better error handling
      newCallObject.on("camera-error", (error: any) => {
        console.error("Camera error:", error);
        setError(
          `Camera error: ${error.message}. Please check your camera permissions.`
        );
        setIsLoading(false);
      });

      newCallObject.on("microphone-error", (error: any) => {
        console.error("Microphone error:", error);
        setError(
          `Microphone error: ${error.message}. Please check your microphone permissions.`
        );
        setIsLoading(false);
      });

      // Track participant events to get video and audio tracks
      newCallObject.on("participant-joined", (event: any) => {
        const participant = event.participant;
        console.log("Participant joined:", participant);

        if (
          participant.session_id !==
          newCallObject.participants().local.session_id
        ) {
          setParticipantId(participant.session_id);
        }
      });

      newCallObject.on("track-started", (event: any) => {
        const participant = event.participant;
        console.log("Track started:", event);

        if (
          participant.session_id !==
          newCallObject.participants().local.session_id
        ) {
          if (event.track.kind === "video") {
            setVideoTrack(event.track);
          } else if (event.track.kind === "audio") {
            setAudioTrack(event.track);
          }
        }
      });

      // Join the conversation with the call object
      await newCallObject.join({
        url: conversationUrl,
        startVideoOff: false,
        startAudioOff: false,
      });

      console.log("Successfully joined Tavus conversation");
    } catch (error: any) {
      console.error("Error initializing Daily.js frame:", error);
      setError(`Error initializing Daily.js frame: ${error.message}`);
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Handles the start of the interaction
   * Manages the complete flow of starting a Tavus conversation
   */
  const handleStart = useCallback(async () => {
    console.log("Starting Tavus interaction...");
    setIsLoading(true);
    setIsAvatarVisible(false);
    setError("");
    setConversationHistory([]);
    onStart();

    try {
      // Request microphone and camera access with better error handling
      console.log("Requesting media permissions...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        console.log("Media permissions granted", {
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
        });

        // Stop the tracks immediately as Daily.js will handle them
        stream.getTracks().forEach((track) => track.stop());
      } catch (mediaError: any) {
        console.error("Media permission error:", mediaError);
        setError(
          `Please grant camera and microphone permissions: ${mediaError.message}`
        );
        setIsLoading(false);
        return;
      }

      // Create Tavus conversation
      console.log("Creating Tavus conversation...");
      let conversation;
      try {
        conversation = await createTavusConversation();
        console.log("Conversation created successfully:", {
          id: conversation.conversation_id,
          url: conversation.conversation_url,
        });
      } catch (conversationError: any) {
        console.error("Error creating Tavus conversation:", conversationError);
        setError(
          `Failed to create Tavus conversation: ${conversationError.message}`
        );
        setIsLoading(false);
        return;
      }

      // Initialize Daily.js call object and join the conversation
      console.log("Initializing Daily.js call object...");
      try {
        await initializeDailyFrame(conversation.conversation_url);
      } catch (dailyError: any) {
        console.error("Error initializing Daily.js call object:", dailyError);
        setError(`Failed to initialize video call: ${dailyError.message}`);
        setIsLoading(false);

        // Attempt to clean up the conversation if Daily.js initialization fails
        if (conversation?.conversation_id) {
          try {
            const apiKey = process.env.NEXT_PUBLIC_TAVUS_API_KEY;
            if (!apiKey) {
              console.error(
                "Missing Tavus API key. Cannot clean up failed conversation."
              );
            } else {
              const response = await fetch(
                `https://tavusapi.com/v2/conversations/${conversation.conversation_id}/end`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                  },
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                console.error(
                  `Error cleaning up failed conversation (${response.status}): ${errorText}`
                );
              } else {
                console.log("Cleaned up failed conversation successfully");
              }
            }
          } catch (cleanupError: any) {
            console.error(
              "Failed to clean up conversation:",
              cleanupError.message
            );
          }
        }
        return;
      }

      console.log("Tavus interaction started successfully");
    } catch (error: any) {
      console.error("Unexpected error starting interaction:", error);
      setError(`Unexpected error: ${error.message}`);
    } finally {
      setIsLoading(false); // Ensure loading is set to false after attempt
    }
  }, [
    replicaId,
    personaId,
    onStart,
    createTavusConversation,
    initializeDailyFrame,
  ]);

  /**
   * Handles stopping the interaction
   * Ensures proper cleanup of resources and graceful conversation ending
   */
  const handleStop = useCallback(async () => {
    console.log("Stopping interaction...");
    setIsLoading(false);
    setError("");
    setIsAvatarVisible(false);

    try {
      // End the Tavus conversation first
      if (conversationId) {
        console.log(`Ending Tavus conversation: ${conversationId}`);
        const apiKey = process.env.NEXT_PUBLIC_TAVUS_API_KEY;

        if (!apiKey) {
          console.error(
            "Missing Tavus API key. Cannot end conversation properly."
          );
        } else {
          try {
            // Use the correct API endpoint URL and authorization format
            const response = await fetch(
              `https://tavusapi.com/v2/conversations/${conversationId}/end`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": apiKey,
                },
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                `Error ending conversation (${response.status}): ${errorText}`
              );
            } else {
              console.log("Tavus conversation ended successfully");
            }
          } catch (error: any) {
            console.error(
              "Network error ending Tavus conversation:",
              error.message
            );
          }
        }
      } else {
        console.log("No active conversation ID to end");
      }

      // Leave the Daily call
      if (callObject) {
        console.log("Leaving Daily call...");
        try {
          await callObject.leave();
          callObject.destroy();
          setCallObject(null);
          setVideoTrack(null);
          setAudioTrack(null);
          setParticipantId("");
          console.log("Successfully left Daily call");
        } catch (error: any) {
          console.error("Error leaving Daily call:", error.message);
        }
      } else {
        console.log("No active Daily call to leave");
      }

      // Push transcript to Coval for monitoring
      if (conversationHistory.length > 0) {
        try {
          await pushTranscriptToCoval(conversationHistory, {}, agentId);
          console.log("Transcript pushed to Coval");
        } catch (error: any) {
          console.error("Error pushing transcript to Coval:", error.message);
        }
      } else {
        console.log("No conversation history to push to Coval");
      }

      // Reset state
      setConversationId("");
      setConversationUrl("");
      setConversationHistory([]);

      // Notify parent component
      onClose();
      console.log("Interaction stopped successfully");
    } catch (error: any) {
      console.error("Error during stop interaction:", error.message);
      // Still notify parent component even if there was an error
      onClose();
    }
  }, [onClose, conversationHistory, conversationId, agentId]);

  // Set up video and audio elements when tracks are available
  useEffect(() => {
    if (videoTrack && videoRef.current) {
      // Attach video track to video element
      if (videoTrack.readyState === "live") {
        videoRef.current.srcObject = new MediaStream([videoTrack]);
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    }

    if (audioTrack && audioRef.current) {
      // Attach audio track to audio element
      if (audioTrack.readyState === "live") {
        audioRef.current.srcObject = new MediaStream([audioTrack]);
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
    }

    return () => {
      // Clean up video and audio elements
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [videoTrack, audioTrack]);

  // Clean up call object on unmount
  useEffect(() => {
    return () => {
      if (callObject) {
        callObject.leave();
        callObject.destroy();
      }
    };
  }, [callObject]);

  return (
    <>
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          isolation: "isolate",
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          ref={callWrapperRef}
          className="w-full h-full absolute inset-0"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            zIndex: 1,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {/* Video element for remote participant */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              background: "transparent",
            }}
          />
          {/* Audio element for remote participant */}
          <audio ref={audioRef} autoPlay />
        </div>
      </div>
      <div
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

export default TavusClient;
