import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData);
      setUser(response.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for validation errors from backend
        if (errorData.errors) {
          const backendErrors = {};
          errorData.errors.forEach(err => {
            backendErrors[err.field] = err.message;
          });
          setErrors(backendErrors);
        } else if (errorData.message) {
          // Provide specific error messages
          let errorMessage = errorData.message;
          
          if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
            errorMessage = 'No account found with this email address. Please check your email or sign up.';
          } else if (errorMessage.includes('password') || errorMessage.includes('incorrect') || errorMessage.includes('invalid credentials')) {
            errorMessage = 'Incorrect password. Please try again or reset your password.';
          } else if (errorMessage.includes('disabled') || errorMessage.includes('suspended')) {
            errorMessage = 'Your account has been disabled. Please contact support.';
          }
          
          setErrors({ submit: errorMessage });
        } else {
          setErrors({ submit: 'Login failed. Please check your credentials and try again.' });
        }
      } else if (error.request) {
        // Network error
        setErrors({ 
          submit: 'Cannot connect to server. Please check your internet connection and try again.' 
        });
      } else {
        setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <span className="auth-brand__logo">📚</span>
          <h1 className="auth-brand__title">Campus Mart</h1>
        </div>

        <Card className="auth-card">
          <div className="auth-card__header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@university.edu"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            {errors.submit && (
              <div className="auth-error" role="alert">
                {errors.submit}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
