import React from 'react';
import PropTypes from 'prop-types';

export default function VideoGorusmeKontroller({ mikrofon, kamera, mikToggle, kamToggle, kapat }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '24px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <button
        onClick={mikToggle}
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: mikrofon ? 'rgba(255,255,255,0.15)' : '#F43F5E',
          color: '#fff',
          fontSize: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, transform 0.1s',
          backdropFilter: 'blur(8px)',
        }}
        title={mikrofon ? 'Mikrofonu kapat' : 'Mikrofonu aç'}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {mikrofon ? '🎙️' : '🔇'}
      </button>

      <button
        onClick={kapat}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
          color: '#fff',
          fontSize: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(244,63,94,0.5)',
          transition: 'transform 0.1s',
        }}
        title="Görüşmeyi bitir"
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        📵
      </button>

      <button
        onClick={kamToggle}
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: kamera ? 'rgba(255,255,255,0.15)' : '#F43F5E',
          color: '#fff',
          fontSize: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, transform 0.1s',
          backdropFilter: 'blur(8px)',
        }}
        title={kamera ? 'Kamerayı kapat' : 'Kamerayı aç'}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {kamera ? '📹' : '🚫'}
      </button>
    </div>
  );
}

VideoGorusmeKontroller.propTypes = {
  mikrofon: PropTypes.bool.isRequired,
  kamera: PropTypes.bool.isRequired,
  mikToggle: PropTypes.func.isRequired,
  kamToggle: PropTypes.func.isRequired,
  kapat: PropTypes.func.isRequired,
};
