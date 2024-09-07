import React, {  useState , useEffect } from 'react';
import { supabase } from './supabaseClient.ts';
import { AuthError, Session } from '@supabase/supabase-js';
import { FaEnvelope, FaLock, FaCat } from 'react-icons/fa';
type AuthProps = {
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
};

const Auth: React.FC<AuthProps> = ({ setSession }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      setIsSignUp(true); // Automatically switch to sign-up mode if there's a referral code
    }
  }, []);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let result: { error: AuthError | null; data: { session: Session | null; user: any } };

    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error && result.data.user) {
        await createUserProfile(result.data.user.id);
        if (referralCode) {
          await createReferralRelationship(result.data.user.id, referralCode, email);
        }
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(isSignUp ? 'Sign-up successful! Check your email.' : 'Login successful!');
      setSession(result.data.session);
    }
    setIsLoading(false);
  };

  const createUserProfile = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .insert({ id: userId, cats: 0, username: email });
    
    if (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const createReferralRelationship = async (newUserId: string, referrerId: string, referredEmail: string) => {
    // Create referral relationship
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({ referrer_id: referrerId, referred_user_id: newUserId, referred_email: referredEmail });
  
    if (referralError) {
      console.error('Error creating referral relationship:', referralError);
    } else {
      // Fetch current cats count for referrer
      const { data: referrerData, error: fetchError } = await supabase
        .from('users')
        .select('cats')
        .eq('id', referrerId)
        .single();
  
      if (fetchError) {
        console.error('Error fetching referrer data:', fetchError);
      } else if (referrerData) {
        // Update referrer's cats count
        const newCatsCount = referrerData.cats + 500;
        const { error: updateError } = await supabase
          .from('users')
          .update({ cats: newCatsCount })
          .eq('id', referrerId);
  
        if (updateError) {
          console.error('Error updating referrer cats:', updateError);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded-lg shadow-2xl w-96 transform transition-all hover:scale-105">
        <div className="text-center mb-8">
          <FaCat className="text-6xl mx-auto text-pink-500 mb-2" />
          <h2 className="text-3xl font-bold text-gray-800">Kat Kombat</h2>
          <p className="text-gray-600">
            {isSignUp ? 'Create an account' : 'Welcome back!'}
            {referralCode && ' (Referred by a friend)'}
          </p>
        </div>
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-pink-500"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-pink-500"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-gray-800 bg-gray-100 p-2 rounded">
            {message}
          </p>
        )}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-6 w-full text-center text-sm text-gray-600 hover:text-pink-500 focus:outline-none"
        >
          {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};
export default Auth;
