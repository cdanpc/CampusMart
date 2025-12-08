import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { ACADEMIC_LEVELS } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    academic_level: '',
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
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
    if (!formData.academic_level) newErrors.academic_level = 'Academic level is required';
    
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
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);
      setUser(response.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
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
          
          if (errorMessage.includes('already exists') || errorMessage.includes('already registered') || errorMessage.includes('duplicate')) {
            setErrors({ 
              email: 'This email is already registered. Please login instead or use a different email.',
              submit: 'Account with this email already exists.' 
            });
          } else if (errorMessage.includes('phone')) {
            setErrors({ 
              phone_number: 'Invalid phone number format. Please use format: 09XX XXX XXXX',
              submit: errorMessage 
            });
          } else if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
            setErrors({ 
              email: 'Please use a valid university email address.',
              submit: errorMessage 
            });
          } else if (errorMessage.includes('password')) {
            setErrors({ 
              password: errorMessage.includes('weak') 
                ? 'Password is too weak. Use at least 8 characters with letters and numbers.' 
                : errorMessage,
              submit: 'Password requirements not met.' 
            });
          } else {
            setErrors({ submit: errorMessage });
          }
        } else {
          setErrors({ submit: 'Registration failed. Please check all fields and try again.' });
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
       

        <Card className="auth-card">
          <div className="auth-card__header">
            <h2>Create Account</h2>
            <p>Join Campus Mart and start trading</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__row">
              <Input
                label="First Name"
                type="text"
                name="first_name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />
              <Input
                label="Last Name"
                type="text"
                name="last_name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
            </div>

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
              label="Phone Number"
              type="tel"
              name="phone_number"
              placeholder="09XX XXX XXXX"
              value={formData.phone_number}
              onChange={handleChange}
              error={errors.phone_number}
              required
            />

            <div className="input-group">
              <label htmlFor="academic_level" className="input-label">
                Academic Level<span className="input-required">*</span>
              </label>
              <select
                id="academic_level"
                name="academic_level"
                className={`input ${errors.academic_level ? 'input--error' : ''}`}
                value={formData.academic_level}
                onChange={handleChange}
                required
              >
                <option value="">Select your level</option>
                {ACADEMIC_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {errors.academic_level && (
                <span className="input-error">{errors.academic_level}</span>
              )}
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            {errors.submit && (
              <div className="auth-error" role="alert">
                {errors.submit}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
