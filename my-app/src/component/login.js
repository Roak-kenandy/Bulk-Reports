import React, { useState } from 'react';
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordDialog from '../component/forgotPassword';
import { motion } from 'framer-motion';

const LoginReports = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/bulk-uploads/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token || 'dummy-token');
        setError('');
        setOpenSnackbar(true);
        setTimeout(() => navigate('/operations'), 1000);
      } else {
        setError(data.message || 'Invalid email or password.');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again later.');
      setOpenSnackbar(true);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 100%)',
        fontFamily: 'Poppins, sans-serif',
        color: '#fff',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          background: 'rgba(13, 27, 42, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
          padding: '20px 20px',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <img
            src="https://play-lh.googleusercontent.com/yxgQopZT1ZMjHMufxxN4mRwCzyRaINzwjdWil7ZI-RscRAwCv-Uwwo67_xeAceGEJlb9"
            alt="Medianet Logo"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: '#FFFFFF',
              padding: '10px',
              boxShadow: '0px 0px 20px rgba(200, 181, 96, 0.6)',
            }}
          />
        </motion.div>

        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: '700',
            mb: 1,
            color: '#C8B560',
            textShadow: '0 0 10px rgba(200, 181, 96, 0.5)',
          }}
        >
          Welcome Back
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{
            mb: 4,
            color: '#ffffffaa',
          }}
        >
          Login to access Bulk Reports
        </Typography>

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TextField
              variant="outlined"
              label="Email"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiInputBase-root': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#C8B560',
                },
                '& label': { color: '#C8B560' },
                input: { color: '#fff' },
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <TextField
              variant="outlined"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 4,
                '& .MuiInputBase-root': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#C8B560',
                },
                '& label': { color: '#C8B560' },
                input: { color: '#fff' },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: '#fff' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#C8B560',
                color: '#0D1B2A',
                fontWeight: '700',
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(200, 181, 96, 0.7)',
                '&:hover': {
                  backgroundColor: '#d6c879',
                  boxShadow: '0 0 25px rgba(200, 181, 96, 1)',
                },
                mb: 3,
              }}
            >
              Login
            </Button>

            <Typography align="center">
              <Link
                component="button"
                variant="body2"
                onClick={() => setOpenForgotPassword(true)}
                sx={{
                  color: '#ffffffcc',
                  textDecoration: 'underline',
                  '&:hover': { color: '#C8B560' },
                }}
              >
                Forgot Password?
              </Link>
            </Typography>
          </motion.div>
        </form>
      </motion.div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error || 'Login successful!'}
        </Alert>
      </Snackbar>

      <ForgotPasswordDialog open={openForgotPassword} onClose={() => setOpenForgotPassword(false)} />
    </div>
  );
};

export default LoginReports;
