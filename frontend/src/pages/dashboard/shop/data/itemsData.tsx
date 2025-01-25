// src/data/itemsData.ts

export interface ShopItem {
    id: number;
    name: string;
    description: string;
    buyLabel: string;
    owned: number;
  }
  
  export const items: ShopItem[] = [
    {
      id: 1,
      name: "Mana Regen Band",
      description: "Restores your mana fully.",
      buyLabel: "50",
      owned: 1,
    },
    {
      id: 2,
      name: "Tech Pass",
      description: "Usable for AI Cross-Referencing and OCR features.",
      buyLabel: "50",
      owned: 3,
    },
    {
      id: 3,
      name: "Rewards Multiplier Badge",
      description: "Doubles XP and coin rewards for 24 hours.",
      buyLabel: "50",
      owned: 0,
    },
    {
      id: 4,
      name: "Fortune Coin",
      description: "Increases the chance for rare power card to each game for 3 turns.",
      buyLabel: "50",
      owned: 3,
    },
    {
      id: 5,
      name: "Insightful Token",
      description: "Keeps your wins track event intact, even on a loss streak.",
      buyLabel: "50",
      owned: 0,
    },
    {
      id: 6,
      name: "Study Starter Pack",
      description: "Grants a base XP boost, coins, mana refill, and insightful card.",
      buyLabel: "50",
      owned: 5,
    },
  ];
  