// Import the player status router
import playerStatusRouter from './routes/battle/playerStatus.js';

// ... existing code ...

// Register the player status route
app.use('/api/battle', playerStatusRouter);

// ... existing code ... 