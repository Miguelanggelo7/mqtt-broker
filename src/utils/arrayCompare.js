const arrayCompare = (a, b) => {
  if (a.length !== b.length) return false;

  return b.every((item) => a.includes(item));
};

export default arrayCompare;
