import { MenuItem } from '../types';
import { processConversationWithAI, OrderIntent } from './openaiUtils';

export interface CartUpdate {
  action: 'add' | 'remove' | 'clear' | 'checkout';
  item?: MenuItem;
  quantity?: number;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function processConversationForCart(
  messages: ConversationMessage[],
  menuItems: MenuItem[]
): Promise<CartUpdate[]> {
  // Get order intents from ChatGPT
  const orderIntents = await processConversationWithAI(messages, menuItems);

  console.log('Order Intents:', orderIntents);
  
  // Convert order intents to cart updates
  const updates: CartUpdate[] = [];
  
  // Check for checkout intent first
  const hasCheckoutIntent = orderIntents.some(intent => intent.action === 'checkout');
  if (hasCheckoutIntent) {
    return [{ action: 'checkout' }];
  }
  
  // Process other intents if no checkout
  for (const intent of orderIntents) {
    switch (intent.action) {
      case 'add':
        if (intent.itemName) {
          const menuItem = findMenuItem(menuItems, intent.itemName);
          if (menuItem) {
            updates.push({
              action: 'add',
              item: menuItem,
              quantity: intent.quantity || 1
            });
          }
        }
        break;
        
      case 'remove':
        if (intent.itemName) {
          const menuItem = findMenuItem(menuItems, intent.itemName);
          if (menuItem) {
            updates.push({
              action: 'remove',
              item: menuItem,
              quantity: intent.quantity
            });
          }
        }
        break;
        
      case 'clear':
        updates.push({ action: 'clear' });
        break;
    }
  }

  console.log('Cart Updates:', updates);
  
  return updates;
}

export function findMenuItem(menuItems: MenuItem[], itemName: string): MenuItem | undefined {
  const normalizedSearch = itemName.toLowerCase().trim();
  return menuItems.find(item => {
    const normalizedName = item.name.toLowerCase().trim();
    return normalizedName.includes(normalizedSearch) ||
           normalizedSearch.includes(normalizedName);
  });
}

export function updateCart(
  currentCart: MenuItem[],
  update: CartUpdate
): MenuItem[] {
  switch (update.action) {
    case 'add':
      if (!update.item) return currentCart;
      const addExistingItemIndex = currentCart.findIndex(
        item => item.id === update.item?.id
      );
      
      if (addExistingItemIndex >= 0) {
        return currentCart.map((item, index) =>
          index === addExistingItemIndex
            ? { ...item, quantity: (item.quantity || 0) + (update.quantity || 1) }
            : item
        );
      } else {
        return [...currentCart, { ...update.item, quantity: update.quantity || 1 }];
      }
      
    case 'remove':
      if (!update.item) return currentCart;
      const removeExistingItemIndex = currentCart.findIndex(
        item => item.id === update.item?.id
      );
      
      if (removeExistingItemIndex === -1) return currentCart;
      
      const currentQuantity = currentCart[removeExistingItemIndex].quantity || 1;
      const removeQuantity = update.quantity || currentQuantity;
      
      if (currentQuantity <= removeQuantity) {
        return currentCart.filter(item => item.id !== update.item?.id);
      }
      
      return currentCart.map(item =>
        item.id === update.item?.id
          ? { ...item, quantity: currentQuantity - removeQuantity }
          : item
      );
      
    case 'clear':
      return currentCart;

    case 'checkout':
      // Trigger checkout event and return current cart
      const event = new CustomEvent("handleCheckout", {
        detail: { 
          orderId: Math.random().toString(36).substr(2, 9).toUpperCase(),
          cart: currentCart
        }
      });
      window.dispatchEvent(event);
      return currentCart;
      
    default:
      return currentCart;
  }
}
