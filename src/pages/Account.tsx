import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthStore } from '../store/authStore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';

export function Account() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const { user, isAdmin, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingAction(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // You could save firstName/lastName to Firestore here
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoadingAction(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Google Auth error');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoadingAction(true);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingAction(false);
    }
  };

  if (isLoading) {
    return <div className="w-full min-h-screen flex items-center justify-center bg-background text-foreground uppercase tracking-widest text-xs">Loading...</div>;
  }

  if (user) {
    return (
      <div className="w-full min-h-[80vh] pt-40 px-6 pb-20 bg-background flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <h1 className="font-serif text-4xl sm:text-5xl tracking-wide text-foreground mb-6 uppercase">
            My Account
          </h1>
          <p className="text-foreground/60 mb-12">Logged in as {user.email}</p>

          <div className="flex flex-col gap-4">
            {isAdmin && (
              <Link 
                to="/admin"
                className="bg-accent text-background py-4 uppercase text-xs tracking-[0.2em] font-medium hover:opacity-90 transition-opacity w-full text-center"
              >
                Admin Portal
              </Link>
            )}
            <button
              onClick={handleSignOut}
              disabled={isLoadingAction}
              className="border border-border-color text-foreground py-4 uppercase text-xs tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-colors w-full"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[80vh] pt-32 md:pt-40 px-6 pb-20 bg-background flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <h1 className="font-serif text-4xl sm:text-5xl tracking-wide text-foreground mb-12 text-center uppercase">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h1>

        <div className="flex gap-8 mb-8 border-b border-border-color">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`uppercase text-xs tracking-[0.2em] font-medium pb-4 transition-colors relative flex-1 text-center ${
              isLogin ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/80'
            }`}
          >
            Sign In
            {isLogin && (
              <motion.div
                layoutId="account-tab"
                className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`uppercase text-xs tracking-[0.2em] font-medium pb-4 transition-colors relative flex-1 text-center ${
              !isLogin ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/80'
            }`}
          >
            Create Account
            {!isLogin && (
              <motion.div
                layoutId="account-tab"
                className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
              />
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-sans">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
            onSubmit={handleEmailAuth}
          >
            {!isLogin && (
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="uppercase text-[10px] tracking-widest text-foreground/60">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-transparent border-b border-border-color py-3 text-foreground font-sans focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/20"
                    placeholder="Jane"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="uppercase text-[10px] tracking-widest text-foreground/60">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-transparent border-b border-border-color py-3 text-foreground font-sans focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/20"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="uppercase text-[10px] tracking-widest text-foreground/60">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-b border-border-color py-3 text-foreground font-sans focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/20"
                placeholder="email@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="uppercase text-[10px] tracking-widest text-foreground/60">Password</label>
                {isLogin && (
                  <button type="button" className="uppercase text-[9px] tracking-widest text-accent hover:text-foreground transition-colors">
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-b border-border-color py-3 text-foreground font-sans focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingAction}
              className="mt-8 bg-foreground text-background py-5 uppercase text-xs tracking-[0.2em] font-medium hover:bg-accent transition-colors w-full disabled:opacity-50"
            >
              {isLoadingAction ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="mt-12 text-center">
          <p className="text-foreground/40 text-xs font-sans mb-4">Or continue with</p>
          <div className="flex gap-4 justify-center">
            <button 
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoadingAction}
              className="flex-1 py-3 border border-border-color text-foreground uppercase text-[10px] tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
