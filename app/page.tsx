'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Smooth transition sequence (~2.4s total):
    // Starts animation immediately on mount with 60fps CSS keyframes
    // Triggers fade out at 2.1s
    // Redirects to /login at 2.45s
    const tFade = setTimeout(() => setIsFadingOut(true), 2100);
    const tRedirect = setTimeout(() => {
      router.push('/login');
    }, 2450);

    return () => {
      clearTimeout(tFade);
      clearTimeout(tRedirect);
    };
  }, [router]);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#00132b',
        backgroundImage: `
          radial-gradient(circle at 50% 35%, rgba(0, 70, 160, 0.35) 0%, transparent 60%),
          radial-gradient(circle at 50% 65%, rgba(255, 215, 0, 0.08) 0%, transparent 55%),
          radial-gradient(circle at 50% 50%, #001a3b 0%, #000c1d 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        zIndex: 99999,
        userSelect: 'none',
        padding: '1.5rem',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Dynamic Keyframe Animations */}
      <style jsx global>{`
        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.75) translateY(20px);
            filter: blur(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }

        @keyframes auraPulse {
          0%, 100% {
            box-shadow: 0 0 35px rgba(255, 215, 0, 0.25), 0 20px 50px rgba(0, 0, 0, 0.6);
            border-color: rgba(255, 215, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 60px rgba(255, 215, 0, 0.5), 0 25px 60px rgba(0, 0, 0, 0.7);
            border-color: rgba(255, 215, 0, 0.9);
          }
        }

        @keyframes rucSlideUp {
          0% {
            opacity: 0;
            transform: translateY(22px);
            letter-spacing: 0.5em;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0.35em;
          }
        }

        @keyframes titleSlideUp {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes subReveal {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progressFill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes ambientFloat {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 0.9; }
        }
      `}</style>

      {/* Ambient background glowing circle */}
      <div 
        style={{
          position: 'absolute',
          width: '38rem',
          height: '38rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, rgba(0,47,99,0) 70%)',
          pointerEvents: 'none',
          animation: 'ambientFloat 12s ease-in-out infinite alternate',
        }} 
      />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '32rem', width: '100%' }}>
        
        {/* LOGO CONTAINER WITH SLEEK GOLD AURA */}
        <div 
          style={{
            animation: 'logoReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            marginBottom: '1.75rem',
          }}
        >
          <div 
            style={{
              position: 'relative',
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              padding: '9px',
              border: '2px solid rgba(255, 215, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              animation: 'auraPulse 3s ease-in-out infinite',
            }}
          >
            <img 
              src="/ruc-logo.png" 
              alt="RUC Logo" 
              width={112} 
              height={112} 
              style={{ objectFit: 'contain', width: '100%', height: '100%', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
            />
          </div>
        </div>

        {/* "RUC" INSTITUTIONAL TEXT */}
        <div 
          style={{
            animation: 'rucSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
            opacity: 0,
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.35em',
            background: 'linear-gradient(135deg, #FFF2A8 0%, #FFD700 50%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            marginBottom: '0.35rem',
            filter: 'drop-shadow(0 2px 10px rgba(255, 215, 0, 0.3))',
          }}
        >
          RUC
        </div>

        {/* "PRAYER UNIT" HEADING */}
        <div 
          style={{
            animation: 'titleSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.55s forwards',
            opacity: 0,
            fontSize: '2.75rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '1rem',
            textShadow: '0 4px 25px rgba(0, 0, 0, 0.5)',
          }}
        >
          PRAYER UNIT
        </div>

        {/* SUBTITLE DIVIDER LINE */}
        <div 
          style={{
            animation: 'subReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards',
            opacity: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            width: '100%',
            justifyContent: 'center',
            marginBottom: '3.25rem',
          }}
        >
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.6))', maxWidth: '4rem' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Attendance Management System
          </span>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(255,215,0,0.6), transparent)', maxWidth: '4rem' }} />
        </div>

        {/* LUXURY PROGRESS BAR */}
        <div 
          style={{ 
            width: '13rem', 
            height: '4px', 
            backgroundColor: 'rgba(255, 255, 255, 0.12)', 
            borderRadius: '9999px', 
            overflow: 'hidden', 
            position: 'relative',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              backgroundColor: '#FFD700',
              borderRadius: '9999px',
              animation: 'progressFill 2.1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
              boxShadow: '0 0 12px #FFD700',
            }}
          />
        </div>
      </div>
    </div>
  );
}
