import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient.ts';

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

      if (error) throw error;

      setLeaderboardData(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen p-6 mb-20">
      <h1 className='bg-gradient-to-r flex justify-center text-center text-xl font-serif from-[#4343FF] via-[#EC55FF] to-[#FFD939] py-10 text-transparent bg-clip-text'>KatKombat Leaderboard 🏆</h1>
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
                  <td className="py-3 px-4">
                  {user.username ? (user.username.length > 5 ? user.username.slice(0, 10) + '...' : user.username) : 'Anon. Cat Lover'}
                    </td>
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

export default Leaderboard;
