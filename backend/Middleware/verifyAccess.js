const Task = require("../model/Task");

async function verifyTaskAccess(req, res, next) {
  const taskId = req.params.id;
  const user = req.user; // From authMiddleware, contains user._id, user.tenantId, user.role

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the task belongs to the user's tenant
    if (task.tenantId.toString() !== user.tenantId.toString()) {
      return res.status(403).json({ message: "Access denied: Task belongs to another tenant" });
    }

    // Optional: Role-based access control
    // For example, only tenant admins or the user assigned to the task can edit/delete
    if (req.method === "PUT" || req.method === "DELETE") {
      if (
        user.role !== "tenant-admin" &&
        user._id.toString() !== task.assignedTo?.toString() &&
        user._id.toString() !== task.createdBy.toString()
      ) {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
    }

    // If passed all checks, attach task to request for further use if needed
    req.task = task;

    next();
  } catch (err) {
    console.error("verifyTaskAccess error:", err);
    res.status(500).json({ message: "Server error" });
  }

}

module.exports = verifyTaskAccess;
