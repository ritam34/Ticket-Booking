const { randomUUID } = require('crypto');
const redisClient = require('../config/redis');

const LOCK_TTL = parseInt(process.env.SEAT_LOCK_TTL_SECONDS || '300', 10); // 5 min default

const lockKey = (scheduleId, classType, seatNumber) =>
  `seatlock:${scheduleId}:${classType}:${seatNumber}`;

/**
 * Attempts to lock a list of seats atomically.
 * Uses Redis SET NX (set-if-not-exists) so two users racing for the same
 * seat can never both succeed. If ANY seat in the batch is already locked
 * or booked, the whole batch is rolled back (all-or-nothing).
 *
 * Returns { success: boolean, lockToken, failedSeats: [] }
 */
async function lockSeats(scheduleId, classType, seatNumbers) {
  const lockToken = randomUUID();
  const acquired = [];

  for (const seatNumber of seatNumbers) {
    const key = lockKey(scheduleId, classType, seatNumber);
    // NX = only set if not already present, EX = auto-expire (self-healing if user abandons flow)
    const result = await redisClient.set(key, lockToken, 'EX', LOCK_TTL, 'NX');
    if (result === 'OK') {
      acquired.push(seatNumber);
    } else {
      // Failed to acquire this seat — release everything we grabbed so far
      await releaseSeats(scheduleId, classType, acquired, lockToken);
      return { success: false, lockToken: null, failedSeats: [seatNumber] };
    }
  }

  return { success: true, lockToken, failedSeats: [] };
}

/**
 * Releases seats, but only if they're still held by the given lockToken
 * (prevents accidentally releasing a lock some other request just acquired
 * after this one's TTL expired).
 */
async function releaseSeats(scheduleId, classType, seatNumbers, lockToken) {
  for (const seatNumber of seatNumbers) {
    const key = lockKey(scheduleId, classType, seatNumber);
    const currentValue = await redisClient.get(key);
    if (currentValue === lockToken) {
      await redisClient.del(key);
    }
  }
}

/** Checks whether a set of seats are currently free (not locked). */
async function checkSeatsAvailable(scheduleId, classType, seatNumbers) {
  const pipeline = redisClient.pipeline();
  seatNumbers.forEach((s) => pipeline.exists(lockKey(scheduleId, classType, s)));
  const results = await pipeline.exec();
  const lockedSeats = seatNumbers.filter((_, idx) => results[idx][1] === 1);
  return { allAvailable: lockedSeats.length === 0, lockedSeats };
}

/** Verifies a lockToken still owns all given seats (called right before confirming payment). */
async function verifyLock(scheduleId, classType, seatNumbers, lockToken) {
  for (const seatNumber of seatNumbers) {
    const value = await redisClient.get(lockKey(scheduleId, classType, seatNumber));
    if (value !== lockToken) return false;
  }
  return true;
}

/** Extends TTL on an existing lock (e.g. while user is on the payment page). */
async function extendLock(scheduleId, classType, seatNumbers, lockToken, extraSeconds = LOCK_TTL) {
  for (const seatNumber of seatNumbers) {
    const key = lockKey(scheduleId, classType, seatNumber);
    const value = await redisClient.get(key);
    if (value === lockToken) {
      await redisClient.expire(key, extraSeconds);
    }
  }
}

module.exports = { lockSeats, releaseSeats, checkSeatsAvailable, verifyLock, extendLock, LOCK_TTL };
