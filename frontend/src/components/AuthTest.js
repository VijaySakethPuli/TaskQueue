import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, Stack, Alert } from '@mui/material';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

const AuthTest = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let data;
            if (isLogin) {
                data = await api.login({ email: formData.email, password: formData.password });
            } else {
                data = await api.register(formData);
            }
            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/tasks');
            } else {
                setError('No token received.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 6 }}>
            <Typography variant="h5" align="center" gutterBottom>
                {isLogin ? 'Login' : 'Register'}
            </Typography>
            <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => setIsLogin(!isLogin)}
            >
                Switch to {isLogin ? 'Register' : 'Login'}
            </Button>
            <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    {!isLogin && (
                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            fullWidth
                        />
                    )}
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </Button>
                </Stack>
            </form>
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}
        </Paper>
    );
};

export default AuthTest; 