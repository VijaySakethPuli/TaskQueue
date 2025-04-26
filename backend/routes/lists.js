const express = require('express');
const router = express.Router();
const List = require('../models/List');
const auth = require('../middleware/auth');

// Get all lists for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new list
router.post('/', auth, async (req, res) => {
  try {
    const list = new List({ name: req.body.name, user: req.user.id });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: 'Could not create list' });
  }
});

// Rename a list
router.put('/:id', auth, async (req, res) => {
  try {
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name: req.body.name },
      { new: true }
    );
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (err) {
    res.status(400).json({ error: 'Could not update list' });
  }
});

// Delete a list
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json({ message: 'List deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Could not delete list' });
  }
});

module.exports = router; 