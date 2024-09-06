import { useState } from 'react';
import { GoHome } from "react-icons/go";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlineLeaderboard } from "react-icons/md";

// Home Component
function Home() {
  const [count, setCount] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  const handleClick = (e:any) => {
    // Increment count
    setCount(count + 2);
    
    // Set the click position
    setClickPosition({ x: e.clientX, y: e.clientY });

    // Show the animation
    setShowBonus(true);

    // Hide animation after 1 second
    setTimeout(() => {
      setShowBonus(false);
    }, 1000);
  };

  return (
    <div>
      <h1 className='flex justify-center font-serif items-center font-bold text-4xl text-center bg-gradient-to-r from-[#ff4343] via-[#3900f4] to-[#00fbff] text-transparent bg-clip-text pt-10'>Kat Kombat</h1>
      <div className="text-white gap-4">
        <div onClick={handleClick} className="relative">
          <div className='flex justify-center pt-10 items-center text-center'>
            <img src='/angelcat.png' alt='kute cat' />
          </div>
          
          {/* Floating "+2 😸" Animation */}
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

      {/* action buttons */}
      <div className="flex flex-row items-center justify-center mt-14 pb-10 gap-4">
        <button className="w-[100px] h-[43px] bg-black text-white font-semibold text-xs rounded-md font-mono box-border flex justify-center items-center px-3 py-4 gap-3 bg-opacity-85 border border-white shadow-[1px_2px_0px_rgba(0,0,0,0.8)]">
          <img src='/Share.webp' className="invert" alt='share' /> Share
        </button>
        <button className="box-border flex justify-center items-center px-3 font-mono py-4 gap-2 border border-black shadow-[1px_2px_0px_rgba(0,0,0,0.8)] rounded-lg flex-none order-1 w-[125px] h-[43px] bg-white text-black font-semibold text-xs">
          <img src='/leaderboardstaricon.png' alt='leaderboardstaricon' /> Leaderboard
        </button>
      </div>
    </div>
  );
}


// CSS for the floating animation
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

// Leaderboard Component
function Leaderboard() {
  return (
    <div className="flex justify-center items-center text-center text-white">
      <h1 className="font-bold text-4xl">Leaderboard</h1>
    </div>
  );
}

// Friends Component
function Friends() {
  return (
    <div className="flex justify-center items-center text-center text-white">
      <h1 className="font-bold text-4xl">Friends</h1>
    </div>
  );
}

function App() {
  const [activeComponent, setActiveComponent] = useState('home'); // State to manage active component

  const renderComponent = () => {
    switch (activeComponent) {
      case 'home':
        return  <div>  <style>{styles}</style>   <Home /> </div>;
      case 'leaderboard':
        return <Leaderboard />;
      case 'friends':
        return <Friends />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      {/* Render the active component */}
      {renderComponent()}

      {/* Bottom Navbar */}
      <div className="fixed md:hidden bottom-0 w-full h-[78px]  border border-[#f0d9e5] shadow-[1px_2px_0px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#f0d9e5] to-[#ffffff] text-white flex flex-row items-center justify-center md:max-w-[400px] mx-auto">
        <button
          onClick={() => setActiveComponent('home')}
          className={`flex flex-col items-center justify-center w-[33%] ${activeComponent === 'home' ? 'text-black' : 'text-[#545454]'}`}
        >
          <GoHome size={22} />
          <div className="text-[12px] -mt-1">Home</div>
        </button>
        <button
          onClick={() => setActiveComponent('leaderboard')}
          className={`flex flex-col items-center justify-center w-[33%]  ${activeComponent === 'leaderboard' ? 'text-black' : 'text-[#545454]'}`}
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
}

export default App;
