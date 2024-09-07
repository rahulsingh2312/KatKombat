// Home.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { UserData } from './App';
import WebApp from '@twa-dev/sdk';

interface HomeProps {
  userData: UserData | null;
  setActiveComponent: React.Dispatch<React.SetStateAction<string>>;
}

interface ClickPosition {
  x: number;
  y: number;
}

const Home: React.FC<HomeProps> = ({ userData, setActiveComponent }) => {
  const [count, setCount] = useState<number>(0);
  const [showBonus, setShowBonus] = useState<boolean>(false);
  const [clickPosition, setClickPosition] = useState<ClickPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (userData) {
      fetchCatCount(userData.id);
      checkReferral();
    }
  }, [userData]);

  const fetchCatCount = async (userId: number) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('cats')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No user entry found, creating a new one');
          const { error: insertError } = await supabase
            .from('users')
            .insert({ id: userId, cats: 0, username: userData?.username })
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
    } catch (error) {
      console.error('Error in fetchCatCount:', error);
    }
  };

  const checkReferral = async () => {
    const startParam = WebApp.initDataUnsafe.start_param;
    if (startParam && startParam.startsWith('ref_')) {
      const referrerId = startParam.split('_')[1];
      
      // Check if this user has already been processed for referral
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', userData?.id)
        .single();

      if (!existingReferral) {
        // Add referral record
        await supabase
          .from('referrals')
          .insert({
            referrer_id: referrerId,
            referred_user_id: userData?.id,
            referred_email: userData?.username || ''
          });

        // Award 500 cats to the referrer
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('cats')
          .eq('id', referrerId)
          .single();

        if (referrerData && !referrerError) {
          const newCats = referrerData.cats + 500;
          await supabase
            .from('users')
            .update({ cats: newCats })
            .eq('id', referrerId);
        }
      }
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!userData) {
      console.error('User data is undefined');
      return;
    }

    const newCount = count + 2;
    setCount(newCount);
    setClickPosition({ x: e.clientX, y: e.clientY });
    setShowBonus(true);

    setTimeout(() => {
      setShowBonus(false);
    }, 1000);

    try {
      const { error } = await supabase
        .from('users')
        .update({ cats: newCount, username: userData.username })
        .eq('id', userData.id);

      if (error) {
        console.error('Error updating cat count:', error);
      }
    } catch (error) {
      console.error('Error in handleClick:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className='flex justify-center font-serif items-center font-bold text-4xl text-center bg-gradient-to-r from-[#ff4343] via-[#3900f4] to-[#bcff2c] text-transparent bg-clip-text pt-10'>Kat Kombat</h1>
      <div className="text-white gap-4">
        <div onClick={handleClick} className="relative">
          <div className='flex justify-center pt-10 items-center text-center'>
            <img src='/angelcat.png' alt='cute cat' />
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

      <div className="flex flex-row items-center justify-center mt-14 mb-60 gap-4">
        <button
          className="w-[100px] h-[43px] bg-black text-white font-semibold text-xs rounded-md font-mono box-border flex justify-center items-center px-3 py-4 gap-3 bg-opacity-85 border border-white shadow-[1px_2px_0px_rgba(0,0,0,0.8)]"
          onClick={() => {
            navigator.clipboard.writeText('t.me/katKoombatbot/katkombat')
              .then(() => {
                alert('Copied: t.me/katKoombatbot/katkombat');
              })
              .catch((err) => {
                console.error('Failed to copy: ', err);
              });
          }}
        >
          <img src='/Share.webp' className="invert" alt='share' /> Share
        </button>

        <button 
          onClick={() => setActiveComponent('leaderboard')}
          className="box-border flex justify-center items-center px-3 font-mono py-4 gap-2 border border-black shadow-[1px_2px_0px_rgba(0,0,0,0.8)] rounded-lg flex-none order-1 w-[125px] h-[43px] bg-white text-black font-semibold text-xs"
        >
          <img src='/leaderboardstaricon.png' alt='leaderboard star icon' /> Leaderboard
        </button>
      </div>
    </div>
  );
};

export default Home;
