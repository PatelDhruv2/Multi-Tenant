const cron = require('node-cron');
const Task = require('../model/Task');

const expireTasksJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const result = await Task.updateMany(
        {
          dueDate: { $lt: now },
          status: { $in: ['Todo', 'In Progress'] }
        },
        { status: 'Expired' }
      );

      if (result.modifiedCount > 0) {
        console.log(`[CRON] Expired ${result.modifiedCount} tasks`);
      }
    } catch (err) {
      console.error('[CRON] Task expiry job failed:', err.message);
    }
  });
};

module.exports = expireTasksJob;
