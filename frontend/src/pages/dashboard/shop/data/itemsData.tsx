// src/data/itemsData.ts

// Add imports for all shop item images
import ManaRegenBand from "../../../../assets/shop-picture/mana-band.png";
import TechPass from "../../../../assets/shop-picture/tech-pass.png";
import RewardsMultiplier from "../../../../assets/shop-picture/multiplier-badge.png";
import FortuneCoin from "../../../../assets/shop-picture/fortune-coin.png";
import InsightfulToken from "../../../../assets/shop-picture/insightful-token.png";
import StudyStarterPack from "../../../../assets/shop-picture/study-pack.png";

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  buyLabel: string;
  owned: number;
  image: string;
}

export const items: ShopItem[] = [
  {
    id: 1,
    name: "Mana Regen Band",
    description: "Restores your mana fully.",
    buyLabel: "50",
    owned: 1,
    image: ManaRegenBand,
  },
  {
    id: 2,
    name: "Tech Pass",
    description: "Usable for AI Cross-Referencing and OCR features.",
    buyLabel: "50",
    owned: 3,
    image: TechPass,
  },
  {
    id: 3,
    name: "Rewards Multiplier Badge",
    description: "Doubles XP and coin rewards for 24 hours.",
    buyLabel: "50",
    owned: 0,
    image: RewardsMultiplier,
  },
  {
    id: 4,
    name: "Fortune Coin",
    description:
      "Increases the chance for rare power card to each game for 3 turns.",
    buyLabel: "50",
    owned: 3,
    image: FortuneCoin,
  },
  {
    id: 5,
    name: "Insightful Token",
    description: "Keeps your wins track event intact, even on a loss streak.",
    buyLabel: "50",
    owned: 0,
    image: InsightfulToken,
  },
  {
    id: 6,
    name: "Study Starter Pack",
    description:
      "Grants a base XP boost, coins, mana refill, and insightful card.",
    buyLabel: "50",
    owned: 5,
    image: StudyStarterPack,
  },
];
