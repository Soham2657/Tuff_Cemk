import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', collegeRollNo: '', department: '', universityRollNo: '', year: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-surface-variant rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-level-2 z-10 relative bg-white/60">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">TuffCemk</h1>
          <p className="text-on-surface-variant">The Cemk Experience That you needed but never knew</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                placeholder="Ritam Manna"
              />
            </div>
          )}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">College Roll No</label>
                <input
                  type="text"
                  name="collegeRollNo"
                  value={formData.collegeRollNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  placeholder="e.g. CSE-23-019"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">University Roll No</label>
                <input
                  type="text"
                  name="universityRollNo"
                  value={formData.universityRollNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  placeholder="e.g. 10700123136"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  placeholder="e.g. 3rd Year"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              placeholder="you@cemk.ac.in"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-linear-to-r from-primary to-primary-container text-on-primary py-3 rounded-xl font-bold text-lg hover:shadow-level-3 transition-all transform hover:-translate-y-0.5"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm">
          <p className="text-on-surface-variant">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-secondary font-bold hover:underline"
            >
              {isLogin ? 'Register now' : 'Log in instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
