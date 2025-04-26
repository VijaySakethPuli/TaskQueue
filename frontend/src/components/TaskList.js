import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Container, Card, CardContent, CardActions, Snackbar, Alert, Box, Tooltip, CircularProgress } from '@mui/material';
import { Edit, Delete, Star, StarBorder, AccessAlarm } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TaskList = ({ tasks, onTasksChange, onStarToggle, starredView, loading }) => {
  const [newTask, setNewTask] = useState({ title: '', description: '', remindAt: null });
  const [editTask, setEditTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleRemindAtChange = (date) => {
    setNewTask({ ...newTask, remindAt: date });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    await onTasksChange(null, 'add', {
      title: newTask.title,
      description: newTask.description,
      remindAt: newTask.remindAt ? newTask.remindAt.toISOString() : null,
      starred: false,
      notified: false
    });
    setNewTask({ title: '', description: '', remindAt: null });
    setSnackbar({ open: true, message: 'Task added!', severity: 'success' });
  };

  const handleDelete = async (task) => {
    await onTasksChange(null, 'delete', task);
    setSnackbar({ open: true, message: 'Task deleted!', severity: 'info' });
  };

  const handleEditOpen = (task) => {
    setEditTask({ ...task, remindAt: task.remindAt ? new Date(task.remindAt) : null });
    setDialogOpen(true);
  };

  const handleEditChange = (e) => {
    setEditTask({ ...editTask, [e.target.name]: e.target.value });
  };

  const handleEditRemindAtChange = (date) => {
    setEditTask({ ...editTask, remindAt: date });
  };

  const handleEditSave = async () => {
    await onTasksChange(null, 'edit', {
      ...editTask,
      remindAt: editTask.remindAt ? editTask.remindAt.toISOString() : null
    });
    setDialogOpen(false);
    setEditTask(null);
    setSnackbar({ open: true, message: 'Task updated!', severity: 'success' });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditTask(null);
  };

  const handleStarToggle = async (task) => {
    if (onStarToggle) {
      onStarToggle(task._id);
    } else {
      await onTasksChange(null, 'star', task);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container sx={{ mt: 2, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, maxWidth: 700, mx: 'auto', background: 'transparent' }}>
          {!starredView && (
            <>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2, color: 'primary.light' }}>
                Add a New Task
              </Typography>
              <form onSubmit={handleAddTask}>
                <Stack spacing={2} direction="column">
                  <TextField
                    label="Title"
                    name="title"
                    value={newTask.title}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="filled"
                  />
                  <TextField
                    label="Description"
                    name="description"
                    value={newTask.description}
                    onChange={handleChange}
                    fullWidth
                    variant="filled"
                  />
                  <DateTimePicker
                    label="Remind At"
                    value={newTask.remindAt}
                    onChange={handleRemindAtChange}
                    renderInput={(params) => <TextField {...params} fullWidth variant="filled" />}
                  />
                  <Button type="submit" variant="contained" color="primary" size="large" sx={{ borderRadius: 3, fontWeight: 700 }}>
                    Add Task
                  </Button>
                </Stack>
              </form>
            </>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {tasks.length === 0 && (
                <Typography variant="h6" sx={{ color: 'grey.500', textAlign: 'center', gridColumn: '1/-1', mt: 4 }}>
                  No tasks yet. Enjoy your free time!
                </Typography>
              )}
              {tasks.map((task) => (
                <Card
                  key={task._id}
                  elevation={task.starred ? 8 : 3}
                  sx={{
                    borderRadius: 4,
                    background: task.starred ? 'linear-gradient(135deg, #232526 0%, #FFD740 100%)' : 'linear-gradient(135deg, #232526 0%, #2c3e50 100%)',
                    color: task.starred ? '#232526' : '#fff',
                    boxShadow: task.starred ? '0 4px 24px 0 #FFD74055' : undefined,
                    position: 'relative',
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
                        {task.title}
                      </Typography>
                      <Tooltip title={task.starred ? 'Unstar' : 'Star'}>
                        <IconButton onClick={() => handleStarToggle(task)}>
                          {task.starred ? <Star color="warning" /> : <StarBorder sx={{ color: '#fff' }} />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Typography variant="body1" sx={{ mt: 1, mb: 2, color: task.starred ? '#232526' : 'grey.300' }}>
                      {task.description}
                    </Typography>
                    {task.remindAt && (
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        <AccessAlarm fontSize="small" sx={{ color: task.starred ? 'primary.dark' : 'warning.light' }} />
                        <Typography variant="caption" sx={{ color: task.starred ? 'primary.dark' : 'warning.light' }}>
                          Remind At: {new Date(task.remindAt).toLocaleString()}
                        </Typography>
                      </Stack>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pb: 2 }}>
                    {!starredView && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditOpen(task)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(task)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                name="title"
                value={editTask?.title || ''}
                onChange={handleEditChange}
                fullWidth
                variant="filled"
              />
              <TextField
                label="Description"
                name="description"
                value={editTask?.description || ''}
                onChange={handleEditChange}
                fullWidth
                variant="filled"
              />
              <DateTimePicker
                label="Remind At"
                value={editTask?.remindAt || null}
                onChange={handleEditRemindAtChange}
                renderInput={(params) => <TextField {...params} fullWidth variant="filled" />}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default TaskList; 