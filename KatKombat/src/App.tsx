import React, { useState, useEffect } from 'react';
import { GoHome } from "react-icons/go";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlineLeaderboard } from "react-icons/md";
import { supabase } from './supabaseClient.ts'; // Import Supabase client
import { Session, AuthError } from '@supabase/supabase-js';
import { FaEnvelope, FaLock, FaCat } from 'react-icons/fa';
// Types
type HomeProps = {
  session: Session | null;
};

type ClickPosition = {
  x: number;
  y: number;
};

type AuthProps = {
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
};

// Home Component
const Home: React.FC<HomeProps & { setActiveComponent: React.Dispatch<React.SetStateAction<string>> }> = ({ session, setActiveComponent }) => {
  const [count, setCount] = useState<number>(0);
  const [showBonus, setShowBonus] = useState<boolean>(false);
  const [clickPosition, setClickPosition] = useState<ClickPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (!session || !session.user) {
      console.error('Session or session user is undefined');
      return;
    }

    const fetchCatCount = async (session: Session) => {
      if (!session || !session.user) {
        console.error('Session or session user is undefined');
        return;
      }
    
      const { data, error } = await supabase
        .from('users')
        .select('cats')
        .eq('id', session.user.id)
        .single();
    
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No user entry found, creating a new one');
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({ id: session.user.id, cats: 0, username: session.user.email })
            .select()
            .single();
    
          if (insertError) {
            console.error('Error creating new user entry:', insertError);
          } else {
            console.log('New user entry created successfully');
            setCount(0);
          }
        } else {
          console.error('Error fetching cat count:', error);
        }
      } else if (data) {
        setCount(data.cats);
      }
    };
    fetchCatCount(session);
  }, [session]);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!session || !session.user) {
      console.error('Session or session user is undefined');
      return;
    }

    const newCount = count + 2;
    setCount(newCount);
    setClickPosition({ x: e.clientX, y: e.clientY });
    setShowBonus(true);

    setTimeout(() => {
      setShowBonus(false);
    }, 1000);

    const { error } = await supabase
      .from('users')
      .update({ cats: newCount, username: session.user.email })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating cat count:', error);
    }
  };

  return (
    <div>
      <h1 className='flex justify-center font-serif items-center font-bold text-4xl text-center bg-gradient-to-r from-[#ff4343] via-[#3900f4] to-[#bcff2c] text-transparent bg-clip-text pt-10'>Kat Kombat</h1>
      <div className="text-white gap-4">
        <div onClick={handleClick} className="relative">
          <div className='flex justify-center pt-10 items-center text-center'>
            <img src='/angelcat.png' alt='kute cat' />
          </div>

          {showBonus && (
            <div
              className="absolute text-2xl font-bold text-black"
              style={{
                top: clickPosition.y - 20,
                left: clickPosition.x - 20,
                animation: 'float 1s ease-out',
              }}
            >
              +2 😸
            </div>
          )}

          <div className='flex justify-center mt-10 font-bold text-4xl items-center text-center'>
            <span className='bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] text-transparent bg-clip-text'>{count}</span> 😸
          </div>
          <div className='flex justify-center bg-gradient-to-r from-[#4343FF] via-[#160d17] to-[#060503] text-transparent bg-clip-text text-[0.8rem] mt-5 font-light italic items-center text-center'>
            * "tap anywhere to get limited edition kat tokens"
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center mt-14 pb-10 gap-4">
        <button className="w-[100px] h-[43px] bg-black text-white font-semibold text-xs rounded-md font-mono box-border flex justify-center items-center px-3 py-4 gap-3 bg-opacity-85 border border-white shadow-[1px_2px_0px_rgba(0,0,0,0.8)]">
          <img src='/Share.webp' className="invert" alt='share' /> Share
        </button>
        <button 
                  onClick={() => setActiveComponent('leaderboard')}
        className="box-border flex justify-center items-center px-3 font-mono py-4 gap-2 border border-black shadow-[1px_2px_0px_rgba(0,0,0,0.8)] rounded-lg flex-none order-1 w-[125px] h-[43px] bg-white text-black font-semibold text-xs">
          <img src='/leaderboardstaricon.png' alt='leaderboardstaricon' /> Leaderboard
        </button>
      </div>
    </div>
  );
};

const styles = `
@keyframes float {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px);
    opacity: 0;
  }
}
`;

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<Array<{ username: string, cats: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, cats')
        .order('cats', { ascending: false })
        .limit(50);

      if (error) throw error;

      setLeaderboardData(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen p-6">
      <h1 className='bg-gradient-to-r flex justify-center text-center text-xl font-serif from-[#4343FF] via-[#EC55FF] to-[#FFD939] py-10 text-transparent bg-clip-text'>🏆 Kat Kombat Leaderboard 🏆</h1>
      {loading ? (
        <p className="text-center text-white">Loading leaderboard...</p>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-pink-200">
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-right">Cats</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-pink-50' : 'bg-white'}>
                  <td className="py-3 px-4 font-medium">{index + 1}</td>
                  <td className="py-3 px-4">{user.username || 'Anonymous Cat Lover'}</td>
                  <td className="py-3 px-4 text-right font-bold">
                    {user.cats} 😺
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Friends: React.FC = () => {
  return (
    <div className='bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] py-10 text-transparent bg-clip-text'>
       <h1 className="font-bold text-4xl flex justify-center  items-center text-center">Friends</h1>
    <div className="flex justify-center  items-center text-center py-10">
     <img src='/comingsoon.png' alt='cmgsoon' />
    </div>
    </div>
  );
};

const Auth: React.FC<AuthProps> = ({ setSession }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let result: { error: AuthError | null; data: { session: Session | null } };
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
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

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96 transform transition-all hover:scale-105">
        <div className="text-center mb-8">
          <FaCat className="text-6xl mx-auto text-pink-500 mb-2" />
          <h2 className="text-3xl font-bold text-gray-800">Kat Kombat</h2>
          <p className="text-gray-600">{isSignUp ? 'Create an account' : 'Welcome back!'}</p>
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

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeComponent, setActiveComponent] = useState<string>('home');

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'home':
        return <div><style>{styles}</style><Home session={session} setActiveComponent={setActiveComponent} /></div>;
        case 'leaderboard':
        return <Leaderboard />;
      case 'friends':
        return <Friends />;
      default:
        return <div><style>{styles}</style><Home session={session} setActiveComponent={setActiveComponent} /></div>;
    }
  };

  if (!session) {
    return <Auth setSession={setSession} />;
  }

  return (
    <>
      {renderComponent()}
      <div className="fixed md:hidden bottom-0 w-full h-[78px] border border-[#f0d9e5] shadow-[1px_2px_0px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#f0d9e5] to-[#ffffff] text-white flex flex-row items-center justify-center md:max-w-[400px] mx-auto">
        <button
          onClick={() => setActiveComponent('home')}
          className={`flex flex-col items-center justify-center w-[33%] ${activeComponent === 'home' ? 'text-black' : 'text-[#545454]'}`}
        >
          <GoHome size={22} />
          <div className="text-[12px] -mt-1">Home</div>
        </button>
        <button
          onClick={() => setActiveComponent('leaderboard')}
          className={`flex flex-col items-center justify-center w-[33%] ${activeComponent === 'leaderboard' ? 'text-black' : 'text-[#545454]'}`}
        >
          <MdOutlineLeaderboard />
          <div className="text-[12px]">Leaderboard</div>
        </button>
        <button
          onClick={() => setActiveComponent('friends')}
          className={`flex flex-col items-center justify-center w-[33%] ${activeComponent === 'friends' ? 'text-black' : 'text-[#545454]'}`}
        >
          <FaUserFriends />
          <div className="text-[12px]">Friends</div>
        </button>
      </div>
    </>
  );
};

export default App;