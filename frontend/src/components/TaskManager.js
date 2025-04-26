import React, { useState, useEffect } from 'react';
import {
  Drawer, List, ListItem, ListItemText, ListItemIcon, IconButton, Typography, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Toolbar, Avatar, CircularProgress, Alert
} from '@mui/material';
import { Star, List as ListIcon, Add, Delete, Edit } from '@mui/icons-material';
import TaskList from './TaskList';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const STARRED_LIST_ID = 'starred';

const TaskManager = () => {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [addListDialogOpen, setAddListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [renameListDialogOpen, setRenameListDialogOpen] = useState(false);
  const [renameListName, setRenameListName] = useState('');
  const [listToRename, setListToRename] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasksLoading, setTasksLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', email: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [pwEdit, setPwEdit] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [showNoListDialog, setShowNoListDialog] = useState(false);
  const navigate = useNavigate();

  // Get user info from token
  let user = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      user = jwtDecode(token);
    } catch {}
  }

  // Fetch lists on mount
  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getLists();
        setLists(data);
        if (data.length > 0) setSelectedListId(data[0]._id);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchLists();
  }, []);

  // Fetch tasks when selectedListId changes (not for STARRED_LIST_ID)
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedListId || selectedListId === STARRED_LIST_ID) {
        setTasks([]);
        return;
      }
      setTasksLoading(true);
      setError('');
      try {
        const data = await api.getTasks(selectedListId);
        setTasks(data);
      } catch (err) {
        setError(err.message);
      }
      setTasksLoading(false);
    };
    fetchTasks();
  }, [selectedListId]);

  // Get tasks for the selected list or starred
  const getCurrentTasks = () => {
    if (selectedListId === STARRED_LIST_ID) {
      return lists.length === 0 ? [] : lists.flatMap(list => list.tasks ? list.tasks.filter(task => task.starred) : []);
    }
    return tasks;
  };

  // Add a new list
  const handleAddList = async () => {
    if (!newListName.trim()) return;
    setError('');
    try {
      const list = await api.createList({ name: newListName });
      setLists(prev => [list, ...prev]);
      setSelectedListId(list._id);
      setNewListName('');
      setAddListDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a list
  const handleDeleteList = async (id) => {
    setError('');
    try {
      await api.deleteList(id);
      setLists(prev => prev.filter(l => l._id !== id));
      if (selectedListId === id && lists.length > 1) {
        setSelectedListId(lists[0]._id);
      }
      if (selectedListId === id && lists.length === 1) {
        setSelectedListId(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Rename a list
  const handleRenameList = async () => {
    setError('');
    try {
      const updated = await api.renameList(listToRename._id, { name: renameListName });
      setLists(prev => prev.map(l => l._id === updated._id ? updated : l));
      setRenameListDialogOpen(false);
      setRenameListName('');
      setListToRename(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Add/Edit/Delete/Star tasks in a list (backend)
  const handleTasksChange = async (newTasks, action, payload) => {
    // action: 'add' | 'edit' | 'delete' | 'star'
    setError('');
    try {
      if (action === 'add') {
        const task = await api.createTask(selectedListId, payload);
        setTasks(prev => [task, ...prev]);
      } else if (action === 'edit') {
        const task = await api.updateTask(selectedListId, payload._id, payload);
        setTasks(prev => prev.map(t => t._id === task._id ? task : t));
      } else if (action === 'delete') {
        await api.deleteTask(selectedListId, payload._id);
        setTasks(prev => prev.filter(t => t._id !== payload._id));
      } else if (action === 'star') {
        const task = await api.updateTask(selectedListId, payload._id, { starred: !payload.starred });
        setTasks(prev => prev.map(t => t._id === task._id ? task : t));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Star/unstar from starred view
  const handleStarToggleFromStarred = async (taskId) => {
    setError('');
    // Find the list and task
    for (const list of lists) {
      const task = (await api.getTasks(list._id)).find(t => t._id === taskId);
      if (task) {
        await api.updateTask(list._id, taskId, { starred: !task.starred });
        // Optionally, refresh tasks
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, starred: !t.starred } : t));
        break;
      }
    }
  };

  // For starred view, fetch all tasks for all lists
  useEffect(() => {
    const fetchAllTasks = async () => {
      if (selectedListId !== STARRED_LIST_ID) return;
      setTasksLoading(true);
      setError('');
      try {
        const allTasks = [];
        for (const list of lists) {
          const tasks = await api.getTasks(list._id);
          allTasks.push(...tasks);
        }
        setTasks(allTasks);
      } catch (err) {
        setError(err.message);
      }
      setTasksLoading(false);
    };
    fetchAllTasks();
  }, [selectedListId, lists]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  // Show dialog if no lists after loading
  useEffect(() => {
    if (!loading && lists.length === 0) {
      setShowNoListDialog(true);
    } else {
      setShowNoListDialog(false);
    }
  }, [loading, lists]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 260,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 260,
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
            color: '#fff',
            borderRight: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.2)'
          },
        }}
      >
        <Toolbar sx={{ minHeight: 80 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 1, fontWeight: 700, fontSize: 28 }}>TM</Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, mb: 2 }}>
            Task Manager
          </Typography>
          {user && (
            <>
              <Button variant="text" color="inherit" sx={{ mb: 1 }} onClick={() => setProfileOpen(true)}>
                {user.username || user.email || 'Profile'}
              </Button>
              <Button variant="outlined" color="inherit" size="small" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ overflow: 'auto', flex: 1 }}>
          <List>
            <ListItem
              button
              selected={selectedListId === STARRED_LIST_ID}
              onClick={() => setSelectedListId(STARRED_LIST_ID)}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                background: selectedListId === STARRED_LIST_ID ? 'rgba(255,215,64,0.12)' : 'none',
                transition: 'background 0.2s',
              }}
            >
              <ListItemIcon><Star color="warning" /></ListItemIcon>
              <ListItemText primary="Starred" />
            </ListItem>
            {lists.map((list, idx) => (
              <ListItem
                button
                key={list._id}
                selected={selectedListId === list._id}
                onClick={() => setSelectedListId(list._id)}
                secondaryAction={
                  <>
                    <IconButton edge="end" size="small" onClick={() => { setListToRename(list); setRenameListDialogOpen(true); setRenameListName(list.name); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" size="small" onClick={() => handleDeleteList(list._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </>
                }
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  background: selectedListId === list._id ? 'rgba(33,150,243,0.18)' : 'none',
                  transition: 'background 0.2s',
                }}
                divider={idx !== lists.length - 1}
              >
                <ListItemIcon><ListIcon /></ListItemIcon>
                <ListItemText primary={list.name} />
              </ListItem>
            ))}
            <ListItem button onClick={() => setAddListDialogOpen(true)} sx={{ borderRadius: 2, mx: 1, my: 0.5 }}>
              <ListItemIcon><Add /></ListItemIcon>
              <ListItemText primary="Add List" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, background: 'linear-gradient(135deg, #232526 0%, #2c3e50 100%)', minHeight: '100vh' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, letterSpacing: 1, mb: 3, color: 'primary.light', mt: 0 }}>
          {selectedListId === STARRED_LIST_ID ? 'Starred Tasks' : (lists.find(l => l._id === selectedListId)?.name || '')}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
        ) : selectedListId === STARRED_LIST_ID ? (
          <TaskList
            tasks={tasks.filter(t => t.starred)}
            onTasksChange={() => {}}
            onStarToggle={handleStarToggleFromStarred}
            starredView
          />
        ) : (
          <TaskList
            tasks={tasks}
            onTasksChange={handleTasksChange}
            loading={tasksLoading}
          />
        )}
      </Box>
      {/* Add List Dialog */}
      <Dialog open={addListDialogOpen} onClose={() => setAddListDialogOpen(false)}>
        <DialogTitle>Add New List</DialogTitle>
        <DialogContent>
          <TextField
            label="List Name"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddListDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddList} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      {/* Rename List Dialog */}
      <Dialog open={renameListDialogOpen} onClose={() => setRenameListDialogOpen(false)}>
        <DialogTitle>Rename List</DialogTitle>
        <DialogContent>
          <TextField
            label="List Name"
            value={renameListName}
            onChange={e => setRenameListName(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameListDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameList} variant="contained">Rename</Button>
        </DialogActions>
      </Dialog>
      {/* User Profile Dialog */}
      <Dialog open={profileOpen} onClose={() => { setProfileOpen(false); setProfileEdit(false); setPwEdit(false); setProfileMsg(''); setPwMsg(''); }}>
        <DialogTitle>User Profile</DialogTitle>
        <DialogContent>
          {user ? (
            <Box>
              {profileEdit ? (
                <>
                  <TextField label="Username" value={profileForm.username} onChange={e => setProfileForm(f => ({ ...f, username: e.target.value }))} fullWidth sx={{ mb: 2 }} />
                  <TextField label="Email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} fullWidth sx={{ mb: 2 }} />
                  <Button variant="contained" onClick={async () => {
                    setProfileMsg('');
                    try {
                      await api.updateProfile(profileForm);
                      setProfileMsg('Profile updated!');
                    } catch (err) {
                      setProfileMsg(err.message);
                    }
                  }} sx={{ mr: 1 }}>Save</Button>
                  <Button onClick={() => setProfileEdit(false)}>Cancel</Button>
                  {profileMsg && <Alert severity={profileMsg.includes('updated') ? 'success' : 'error'} sx={{ mt: 2 }}>{profileMsg}</Alert>}
                </>
              ) : (
                <>
                  <Typography><b>Username:</b> {user.username || '-'}</Typography>
                  <Typography><b>Email:</b> {user.email || '-'}</Typography>
                  <Button variant="text" onClick={() => { setProfileEdit(true); setProfileForm({ username: user.username, email: user.email }); }}>Edit Profile</Button>
                </>
              )}
              <Divider sx={{ my: 2 }} />
              {pwEdit ? (
                <>
                  <TextField label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} fullWidth sx={{ mb: 2 }} />
                  <TextField label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} fullWidth sx={{ mb: 2 }} />
                  <Button variant="contained" onClick={async () => {
                    setPwMsg('');
                    try {
                      await api.changePassword(pwForm);
                      setPwMsg('Password updated!');
                    } catch (err) {
                      setPwMsg(err.message);
                    }
                  }} sx={{ mr: 1 }}>Change</Button>
                  <Button onClick={() => setPwEdit(false)}>Cancel</Button>
                  {pwMsg && <Alert severity={pwMsg.includes('updated') ? 'success' : 'error'} sx={{ mt: 2 }}>{pwMsg}</Alert>}
                </>
              ) : (
                <Button variant="text" onClick={() => setPwEdit(true)}>Change Password</Button>
              )}
            </Box>
          ) : (
            <Typography>No user info available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setProfileOpen(false); setProfileEdit(false); setPwEdit(false); setProfileMsg(''); setPwMsg(''); }}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Prompt to create first list if none exist */}
      <Dialog open={showNoListDialog} onClose={() => setShowNoListDialog(false)}>
        <DialogTitle>No Lists Found</DialogTitle>
        <DialogContent>
          <Typography>You don&apos;t have any lists yet. Create your first list to get started!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowNoListDialog(false); setAddListDialogOpen(true); }}>Create List</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManager; 