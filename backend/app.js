// Import the consolidated battle routes
import battleRoutes from './routes/battle.routes.js';

// Add the battle routes to the express app
app.use('/api/battle', battleRoutes); 