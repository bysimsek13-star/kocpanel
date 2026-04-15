const reportWebVitals = onPerfEntry => {
  if (typeof onPerfEntry !== 'function') return;
  import('web-vitals')
    .then(mod => {
      ['getCLS', 'getINP', 'getLCP', 'getTTFB', 'getFCP'].forEach(fn => {
        if (typeof mod[fn] === 'function') mod[fn](onPerfEntry);
      });
    })
    .catch(() => {});
};

export default reportWebVitals;
