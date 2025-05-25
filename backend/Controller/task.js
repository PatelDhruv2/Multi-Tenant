const Task = require("../model/Task");

// Create a new task
exports.createTask = async (req, res) => {
  const user = req.user;
  const { title, description, status, priority, assignedTo, dueDate } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      tenantId: user.tenantId,
      assignedTo,
      dueDate,
      createdBy: user._id,
    });

    await newTask.save();
    return res.status(201).json(newTask);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Get all tasks for tenant or by assigned user
exports.getTasks = async (req, res) => {
  const user = req.user;
  const assignedTo = req.query.assignedTo;

  try {
    const filter = { tenantId: user.tenantId };
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter);
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Get single task details (tenant check done by middleware)
exports.getTaskById = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Update task details (tenant + role check in middleware)
exports.updateTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, req.body);
    await task.save();

    return res.json(task);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.remove();
    return res.json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.markTaskCompleted = async (req, res) => {
  const taskId = req.params.id;
  const user = req.user;

  try {
    const task = await Task.findById(taskId);

    if (!task || task.organization.toString() !== user.organization.toString()) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    // Only allow if user is admin, manager, or assigned to task
    if (
      user.role !== 'Admin' &&
      user.role !== 'Manager' &&
      task.assignedTo.toString() !== user.id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to complete this task' });
    }

    // Check if task is already completed or expired
    if (task.status === 'Completed') {
      return res.status(400).json({ message: 'Task is already completed' });
    }

    if (task.status === 'Expired') {
      return res.status(400).json({ message: 'Expired task cannot be marked completed' });
    }

    task.status = 'Completed';
    await task.save();

    return res.status(200).json({ message: 'Task marked as completed', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
