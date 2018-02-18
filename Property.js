module.exports = ({get, set}) => (...args) => {
  if (args.length === 0) {
    if (!get) {
      throw new Error('Property has no getter');
    }

    return get();
  }
  
  if (args.length === 1) {
    if (!set) {
      throw new Error('Property has no setter');
    }

    return set(args[0]);
  }

  throw new Error('Property function takes 0 (get) or 1 (set) arguments');
};