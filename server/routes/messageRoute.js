
import express from 'express'
import { protectRoute } from '../middleware/auth.js';
import { getMessages, getUserForSidebar, markMessageSeen, sendMessage } from '../controllers/messageControl.js';

const msgRouter = express.Router();


msgRouter.get('/users',protectRoute,getUserForSidebar);

msgRouter.get('/:id',protectRoute,getMessages);

msgRouter.put('/mark/:id',protectRoute,markMessageSeen);

msgRouter.post('/send/:id',protectRoute,sendMessage);

export default msgRouter