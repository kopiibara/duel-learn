//server.ts
import app from "./index"; // Import the app instance from index.ts
import dotenv from "dotenv";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("ENV PORT:", process.env.PORT);
  console.log("Using PORT:", PORT);
});
