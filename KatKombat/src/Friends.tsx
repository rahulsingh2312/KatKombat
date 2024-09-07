// Friends.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { FaUserPlus, FaLink, FaUsers } from 'react-icons/fa';
import { UserData } from './App';

interface Referral {
  id: string;
  referred_email: string;
  cats: number;
}

interface FriendsProps {
  userData: UserData | null;
}

const Friends: React.FC<FriendsProps> = ({ userData }) => {
  const [referralLink, setReferralLink] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalBonus, setTotalBonus] = useState<number>(0);

  useEffect(() => {
    if (userData) {
      const link = `https://t.me/katKoombatbot/katkombat?ref=${userData.id}`;
      setReferralLink(link);
      fetchReferrals();
    }
  }, [userData]);

  const fetchReferrals = async () => {
    if (!userData) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_email,
          referred_user_id,
          users:referred_user_id(cats)
        `)
        .eq('referrer_id', userData.id);

      if (error) {
        console.error('Error fetching referrals:', error);
        return;
      }

      const referralsData = data.map(item => ({
        id: item.id,
        referred_email: item.referred_email,
        cats: (item.users as any)?.cats || 0,
      }));

      setReferrals(referralsData);

      const bonus = referralsData.length * 500;
      setTotalBonus(bonus);
    } catch (error) {
      console.error('Error in fetchReferrals:', error);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => alert('Referral link copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err));
  };

  return (
    <div className="p-6 pt-14 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] text-transparent bg-clip-text">
        Friends & Referrals
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaLink className="mr-2 text-pink-500" /> Your Referral Link
        </h2>
        <div className="flex items-center">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-grow p-2 border rounded-l-md"
          />
          <button
            onClick={copyReferralLink}
            className="bg-pink-500 text-white p-2 rounded-r-md hover:bg-pink-600 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaUserPlus className="mr-2 text-pink-500" /> Referral Bonus
        </h2>
        <p className="text-lg">
          Total Bonus: <span className="font-bold text-pink-500">{totalBonus}</span> Kat Tokens
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaUsers className="mr-2 text-pink-500" /> Referred Friends
        </h2>
        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-center">Cats</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {referrals.map(referral => (
                  <tr key={referral.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {referral.referred_email}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {referral.cats} 😺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">You haven't invited any friends yet.</p>
        )}
      </div>
    </div>
  );
};

export default Friends;