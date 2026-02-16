
import React, { useEffect, useState } from 'react';

const ValentineBackground: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prev) => [
        ...prev.slice(-20),
        {
          id: Date.now(),
          left: Math.random() * 100,
          duration: 5 + Math.random() * 10,
          size: 10 + Math.random() * 30,
        },
      ]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-rose-400 opacity-20 transition-all"
          style={{
            left: `${heart.left}%`,
            bottom: '-50px',
            fontSize: `${heart.size}px`,
            animation: `floatUp ${heart.duration}s linear forwards`,
          }}
        >
          ❤️
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ValentineBackground;
