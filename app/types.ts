export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    emoji: string;
  quantity?: number;
  image?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
  image?: string; // Optional image URL
}
