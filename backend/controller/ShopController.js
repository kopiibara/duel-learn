import { pool } from "../config/db.js";

const shopController = {
    getShopItems: async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT item_code, item_name, item_description, item_price, item_picture_url FROM shop_items");
            res.status(200).json(rows);
        } catch (error) {
            console.error("Error executing query: ", error);
            res.status(500).json({ message: "Error executing query" });
        }
    },

    getUserItem: async (req, res) => {
        const { firebase_uid } = req.params;

        try {
            // Modified query to include quantity and join with shop_items to get all needed info
            const [rows] = await pool.query(
                `SELECT ui.firebase_uid, ui.item_code, ui.quantity, si.item_name, si.item_description, si.item_price, si.item_picture_url
                 FROM user_items ui
                 JOIN shop_items si ON ui.item_code = si.item_code
                 WHERE ui.firebase_uid = ?`,
                [firebase_uid]
            );
            res.json(rows);
        } catch (error) {
            console.error("Error executing query: ", error);
            res.status(500).json({ message: "Error executing query" });
        }
    },

    buyShopItem: async (req, res) => {
        const { firebase_uid, username, item_code, item_price, quantity = 1 } = req.body;

        try {
            // Start a transaction
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // Get item details from shop_items
                const [itemResult] = await connection.query(
                    "SELECT item_code, item_name, item_price FROM shop_items WHERE item_code = ?",
                    [item_code]
                );

                if (itemResult.length === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({ message: "Item not found" });
                }

                const item = itemResult[0];
                const itemPrice = item.item_price;
                const totalPrice = itemPrice * quantity;

                // Check if user has enough coins
                const [userResult] = await connection.query(
                    "SELECT coins FROM user_info WHERE firebase_uid = ?",
                    [firebase_uid]
                );

                if (userResult.length === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({ message: "User not found" });
                }

                const userCoins = userResult[0].coins;

                if (userCoins < totalPrice) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        message: "Insufficient coins",
                        required: totalPrice,
                        available: userCoins
                    });
                }

                // Update user coins with total price
                const newCoinBalance = userCoins - totalPrice;
                await connection.query(
                    "UPDATE user_info SET coins = ? WHERE firebase_uid = ?",
                    [newCoinBalance, firebase_uid]
                );

                // Check if the user already has this item in inventory
                const [existingItem] = await connection.query(
                    "SELECT * FROM user_items WHERE firebase_uid = ? AND item_code = ?",
                    [firebase_uid, item_code]
                );

                if (existingItem.length > 0) {
                    // Update existing item quantity
                    await connection.query(
                        "UPDATE user_items SET quantity = quantity + ? WHERE firebase_uid = ? AND item_code = ?",
                        [quantity, firebase_uid, item_code]
                    );
                } else {
                    // Insert with the correct parameter order and all required fields
                    await connection.query(
                        "INSERT INTO user_items (firebase_uid, username, item_code, item_name, item_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [firebase_uid, username, item_code, item.item_name, item_price, quantity, totalPrice]
                    );
                }

                await connection.commit();
                connection.release();

                // Return the updated coin balance and purchase details
                res.status(200).json({
                    message: "Item bought successfully",
                    remainingCoins: newCoinBalance,
                    quantityPurchased: quantity,
                    totalPrice: totalPrice
                });

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            console.error("Error executing query: ", error);
            res.status(500).json({ message: "Error executing query" });
        }
    },
};

export default shopController;