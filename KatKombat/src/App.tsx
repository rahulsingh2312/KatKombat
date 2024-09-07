// App.tsx
import React, { useState, useEffect } from 'react';
import { GoHome } from "react-icons/go";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlineLeaderboard } from "react-icons/md";
import WebApp from '@twa-dev/sdk';

import Friends from './Friends';
import Home from './Home';
import Leaderboard from './Leaderboard';

// Types
export interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeComponent, setActiveComponent] = useState<string>('home');

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'home':
        return <Home userData={userData} setActiveComponent={setActiveComponent} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'friends':
        return <Friends userData={userData} />;
      default:
        return <Home userData={userData} setActiveComponent={setActiveComponent} />;
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {renderComponent()}
      <nav className="fixed md:hidden bottom-0 w-full h-[78px] border border-[#f0d9e5] shadow-[1px_2px_0px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#f0d9e5] to-[#ffffff] text-white flex flex-row items-center justify-center md:max-w-[400px] mx-auto">
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
          <MdOutlineLeaderboard size={22} />
          <div className="text-[12px]">Leaderboard</div>
        </button>
        <button
          onClick={() => setActiveComponent('friends')}
          className={`flex flex-col items-center justify-center w-[33%] ${activeComponent === 'friends' ? 'text-black' : 'text-[#545454]'}`}
        >
          <FaUserFriends size={22} />
          <div className="text-[12px]">Friends</div>
        </button>
      </nav>
    </>
  );
};

export default App;