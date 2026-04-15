import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const KocContext = createContext(null);

export function KocProvider({
  children,
  ogrenciler,
  dashboardMap,
  bugunMap,
  okunmamisMap,
  yukleniyor,
  yenile,
}) {
  return (
    <KocContext.Provider
      value={{ ogrenciler, dashboardMap, bugunMap, okunmamisMap, yukleniyor, yenile }}
    >
      {children}
    </KocContext.Provider>
  );
}

KocProvider.propTypes = {
  children: PropTypes.node.isRequired,
  ogrenciler: PropTypes.arrayOf(PropTypes.object),
  dashboardMap: PropTypes.object,
  bugunMap: PropTypes.object,
  okunmamisMap: PropTypes.object,
  yukleniyor: PropTypes.bool,
  yenile: PropTypes.func,
};

export function useKoc() {
  const ctx = useContext(KocContext);
  if (!ctx) throw new Error('useKoc KocProvider dışında kullanıldı');
  return ctx;
}
