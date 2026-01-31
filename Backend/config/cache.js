import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 60,      // 60 sec cache
  checkperiod: 120
});

export default cache;
