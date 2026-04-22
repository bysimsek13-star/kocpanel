import React from 'react';
import PropTypes from 'prop-types';

export default function VideoSeciciVideoPanel({
  seciliPL,
  plVideolar,
  plYukleniyor,
  seciliVideolar,
  onChange,
  onGeri,
  s,
}) {
  const toggle = video => {
    const var_ = seciliVideolar.some(v => v.videoId === video.videoId);
    if (var_) onChange(seciliVideolar.filter(v => v.videoId !== video.videoId));
    else
      onChange([
        ...seciliVideolar,
        {
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.thumbnail,
          duration: video.duration,
          playlistDocId: seciliPL.id,
        },
      ]);
  };

  return (
    <div>
      <button
        onClick={onGeri}
        style={{
          background: 'none',
          border: 'none',
          color: s.accent,
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          padding: '0 0 8px 0',
        }}
      >
        ← {seciliPL.title}
      </button>
      {plYukleniyor ? (
        <div style={{ fontSize: 12, color: s.text3 }}>Yükleniyor...</div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxHeight: 180,
            overflowY: 'auto',
          }}
        >
          {plVideolar.map(v => {
            const secili = seciliVideolar.some(x => x.videoId === v.videoId);
            return (
              <div
                key={v.videoId}
                onClick={() => toggle(v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: secili ? `${s.info ?? s.accent}15` : s.surface2,
                  border: `1px solid ${secili ? (s.info ?? s.accent) : s.border}`,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    flexShrink: 0,
                    background: secili ? (s.info ?? s.accent) : 'transparent',
                    border: `2px solid ${secili ? (s.info ?? s.accent) : s.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {secili && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                </div>
                {v.thumbnail && (
                  <img
                    src={v.thumbnail}
                    alt=""
                    style={{
                      width: 40,
                      height: 22,
                      objectFit: 'cover',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                    loading="lazy"
                  />
                )}
                <span
                  style={{
                    flex: 1,
                    fontSize: 11,
                    color: s.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {v.title}
                </span>
                {v.duration && (
                  <span style={{ fontSize: 10, color: s.text3, flexShrink: 0 }}>{v.duration}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

VideoSeciciVideoPanel.propTypes = {
  seciliPL: PropTypes.object.isRequired,
  plVideolar: PropTypes.array.isRequired,
  plYukleniyor: PropTypes.bool.isRequired,
  seciliVideolar: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onGeri: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
