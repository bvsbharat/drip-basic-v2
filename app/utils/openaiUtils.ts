import OpenAI from 'openai';
import { MenuItem } from '../types';

function debounce<T extends (...args: any[]) => Promise<any>>(func: T, delay: number): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeout: NodeJS.Timeout;
  let resolvePromise: ((value: Awaited<ReturnType<T>> | PromiseLike<Awaited<ReturnType<T>>>) => void) | null = null;
  let rejectPromise: ((reason?: any) => void) | null = null;

  return function(this: any, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    return new Promise((resolve, reject) => {
      clearTimeout(timeout);
      resolvePromise = resolve;
      rejectPromise = reject;

      timeout = setTimeout(async () => {
        try {
          const result = await func.apply(this, args);
          if (resolvePromise) {
            resolvePromise(result);
          }
        } catch (error) {
          if (rejectPromise) {
            rejectPromise(error);
          }
        }
      }, delay);
    });
  };
}

export const debouncedProcessConversationWithAI = debounce(processConversationWithAI, 500);



const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface OrderIntent {
  action: 'add' | 'remove' | 'clear' | 'checkout';
  itemName?: string;
  quantity?: number;
}

const SYSTEM_PROMPT = `
You are a shopping assistant that processes conversation messages and extracts order intents.
For each conversation, return an array of order intents in the following format:
[
  {
    "action": "add" | "remove" | "clear" | "checkout",
    "itemName": "item name" (optional),
    "quantity": number (optional, defaults to 1)
  }
]

Guidelines for processing orders:
1. When adding items, specify the quantity mentioned (default to 1 if not specified)
2. When removing items:
   - If a specific quantity is mentioned (e.g., "remove 2 items"), include that quantity
   - If no quantity is mentioned, remove all of that item
3. For "clear" or "checkout" actions, no itemName or quantity needed
4. Pay attention to quantity words like "all", "both", "one", "two", etc.
5. Detect checkout intents from phrases from assistant like:
  - Congratulate user for successful order placement and enjoy the experience.
  - Order placed
  - Congratulation on your order!
  - Your Order is confirmed
  - Your order has been placed successfully
  - Your order has been confirmed
  - Your order has been successfully placed
   When any of these are detected, return [{"action": "checkout"}]

Only return the JSON array, no other text.
Examples:
User: "Add 2 Windsurf licenses"
[
  {"action": "add", "itemName": "Windsurf", "quantity": 2}
]

User: "I want to place my order now"

Assistant: "Windsurf is a great option, it can convert designs to code and wo"
User: "I want that."
[
  {"action": "add", "itemName": "Windsurf", "quantity": 1}
]
[
  {"action": "checkout"}
]

User: "Let me buy these items"
[
  {"action": "checkout"}
]
`;

export async function processConversationWithAI(
  messages: { role: string; content: string }[],
  menuItems: MenuItem[]
): Promise<OrderIntent[]> {

  try {
    // Create the menu context
    const menuContext = menuItems
      .map(item => `${item.name} - $${item.price}`)
      .join('\n');

    // Format conversation for ChatGPT
    const conversationText = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    console.log('Conversation:', conversationText);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Menu Items:\n${menuContext}\n
Conversation:\n${conversationText}\n
Extract order intents:`
        }
      ],
      temperature: 0.2,
      max_tokens: 150
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    try {
      const orderIntents = JSON.parse(content) as OrderIntent[];
      return orderIntents;
    } catch (e) {
      console.error('Failed to parse ChatGPT response:', e);
      return [];
    }
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    return [];
  }
}
