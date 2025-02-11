"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//server.ts
const index_1 = __importDefault(require("./index")); // Import the app instance from index.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 5001;
index_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("ENV PORT:", process.env.PORT);
    console.log("Using PORT:", PORT);
});
