export const getQueryString = (key) => {
  const res = window.location.search.match(new RegExp(`[\?\&]${key}=([^\&]+)`));
  return res && res[1];
};

export const withTimeout = (fn: Function, timeout: number = 2500) => (...arg) => Promise.race([
  fn(...arg),
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, timeout);
  }),
]);

export * from './logTime';
