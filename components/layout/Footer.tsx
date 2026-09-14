import React from 'react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#002f63', color: '#f8fafc', padding: '1rem 0', textAlign: 'center', fontSize: '0.75rem', marginTop: 'auto', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <p style={{ fontWeight: 500, margin: 0 }}>
          © Copyright RUC Prayer Unit 2026. All Right Reserved. Designed and Developed by{' '}
          <a 
            href="https://my-portfolio-olusola.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: '#ffffff', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', position: 'relative', zIndex: 20 }}
          >
            Timothy Adefemiwa
          </a>
        </p>
      </div>
    </footer>
  );
}
