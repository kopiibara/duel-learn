import express from "express";
import ShopController from "../controller/ShopController.js";

const router = express.Router();

router.get("/items", ShopController.getShopItems);
router.get("/user-item/:firebase_uid", ShopController.getUserItem);

router.post("/buy-item", ShopController.buyShopItem);

export default router;