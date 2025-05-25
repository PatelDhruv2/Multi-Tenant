const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Authroutes = require('./routes/Authroutes');
// const Roleroute = require('./routes/Roleroute');
const Inviteroute = require('./routes/Inviteroute');
const Taskroute = require('./routes/Taskroute'); // Assuming you have a Task route
const expireTasksJob = require('./jobs/expireTasks');
expireTasksJob(); // ✅ Starts background task

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth',Authroutes); // Use auth routes
// app.use('/api/role',Roleroute); // Use role routes
app.use('/api/invite',Inviteroute); // Use invite routes
app.use('/api/task',Taskroute); // Use task routes
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('API is running...');
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
