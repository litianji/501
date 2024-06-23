export const logTime = (info = '') => {
  return (target: any, name: any, discriptor: any) => {
    const oldValue = discriptor.value;
    discriptor.value = function (...args) {
      const start = performance.now();
      const res = oldValue.apply(this, args);
      const end = performance.now();
      console.info(`[${info}][${name}]:%s ms`, end - start);
      return res;
    };
  };
};
