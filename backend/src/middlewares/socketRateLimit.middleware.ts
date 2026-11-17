type RateLimitEntry = {
  count   : number;
  resetAt : number;
};

const requests = new Map<string, RateLimitEntry>();

export const checkSocketRateLimit = (
  userId   : number,
  event    : string,
  limit    : number,
  windowMs : number,
) => {
  const now = Date.now();
  const key = `${userId}:${event}`;

  let entry = requests.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };

    requests.set(key, entry);
  }

  if (entry.count >= limit) {
    return {
      allowed      : false,
      retryAfterMs : entry.resetAt - now,
    };
  }

  entry.count++;

  cleanupExpiredEntries();

  return {
    allowed      : true,
    retryAfterMs : 0,
  };
};


let operations = 0;


const cleanupExpiredEntries = () => {
  operations++;

  if (operations % 1000 !== 0) return;

  const now = Date.now();

  for (const [key, entry] of requests.entries()) {
    if (now >= entry.resetAt) {
      requests.delete(key);
    }
  }
};
