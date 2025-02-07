"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./index"));
// Load environment variables
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 5000;
// Start the server
index_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
