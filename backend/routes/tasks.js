const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const List = require('../models/List');
const auth = require('../middleware/auth');

// Get all tasks in a list for the logged-in user
router.get('/:listId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ list: req.params.listId, user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new task in a list
router.post('/:listId', auth, async (req, res) => {
  try {
    // Ensure the list belongs to the user
    const list = await List.findOne({ _id: req.params.listId, user: req.user.id });
    if (!list) return res.status(404).json({ error: 'List not found' });
    const task = new Task({
      ...req.body,
      list: req.params.listId,
      user: req.user.id
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Could not create task' });
  }
});

// Update a task
router.put('/:listId/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, list: req.params.listId, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Could not update task' });
  }
});

// Delete a task
router.delete('/:listId/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, list: req.params.listId, user: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Could not delete task' });
  }
});

module.exports = router; 