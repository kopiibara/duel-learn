import dotenv from "dotenv";
import app from "./index";

// Load environment variables
dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
