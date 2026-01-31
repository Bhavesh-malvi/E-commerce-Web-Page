import NodeCache from "node-cache";

const cache = new NodeCache();


// Get
export const getCache = (key) => {
  return cache.get(key);
};


// Set
export const setCache = (key, data, ttl = 120) => {
  cache.set(key, data, ttl);
};


// Delete single
export const deleteCache = (key) => {
  cache.del(key);
};


// Clear home cache
export const clearHomeCache = () => {
  cache.del("home_data");
};


// Clear all product related cache
export const clearProductCache = () => {

  const keys = cache.keys();

  keys.forEach(key => {
    if (
      key.startsWith("products_") ||
      key === "home_data"
    ) {
      cache.del(key);
    }
  });

};


export default cache;
