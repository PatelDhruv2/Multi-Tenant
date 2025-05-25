const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/middleware');

const createTask = require('../Controller/task').createTask;
const getTasks = require('../Controller/task').getTasks;
const getTaskById = require('../Controller/task').getTaskById;
const updateTask = require('../Controller/task').updateTask;
const deleteTask = require('../Controller/task').deleteTask;
const VerifyAccess = require('../Middleware/verifyAccess');
const markTaskCompleted = require('../Controller/task').markTaskCompleted;
router.post("/", authMiddleware,createTask);
router.get("/", authMiddleware, getTasks);
router.get("/:id", authMiddleware, VerifyAccess, getTaskById);
router.put("/:id", authMiddleware, VerifyAccess, updateTask);
router.delete("/:id", authMiddleware, VerifyAccess, deleteTask);
router.patch('/:id/complete', authMiddleware,markTaskCompleted);
module.exports = router;
