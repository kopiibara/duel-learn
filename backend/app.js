// Import the player status router
import playerStatusRouter from './routes/battle/playerStatus.js';

// ... existing code ...

// Register the player status route
app.use('/api/battle', playerStatusRouter);

// ... existing code ... 
// Import the consolidated battle routes
import battleRoutes from './routes/battle.routes.js';

// Add the battle routes to the express app
app.use('/api/battle', battleRoutes); 
