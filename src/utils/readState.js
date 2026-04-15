export function isRead(item = {}) {
  if (item.readAt) return true;
  if (item.okunmaZamani) return true;
  if (typeof item.okundu === 'boolean') return item.okundu;
  return false;
}

export function isUnread(item = {}) {
  return !isRead(item);
}

export function readPatch() {
  const now = new Date();
  return {
    okundu: true,
    okunmaZamani: now,
    readAt: now,
  };
}

export function unreadPatch() {
  return {
    okundu: false,
    okunmaZamani: null,
    readAt: null,
  };
}

export function unreadCount(list = [], predicate = () => true) {
  return list.filter(item => predicate(item) && isUnread(item)).length;
}
