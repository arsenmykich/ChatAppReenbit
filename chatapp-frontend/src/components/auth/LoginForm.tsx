import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AuthCard,
  Title,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  LinkButton
} from '../styled/StyledComponents';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login({ email, password });
      if (success) {
        navigate('/chat');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <Title>Welcome Back</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </FormGroup>
        
        <Button
          type="submit"
          disabled={loading}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      
      <div style={{ textAlign: 'center' }}>
        Don't have an account?{' '}
        <LinkButton onClick={onSwitchToRegister}>
          Sign up here
        </LinkButton>
      </div>
    </AuthCard>
  );
}; 