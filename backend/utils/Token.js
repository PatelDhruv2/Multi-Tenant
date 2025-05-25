// Encodes orgId and role into a base64 key
const createPasskey = (orgId, role) => {
  const data = JSON.stringify({ orgId, role });
  return Buffer.from(data).toString('base64').replace(/=/g, '').slice(0, 12); // short & clean
};

const decodePasskey = (key) => {
  try {
    const paddedKey = key + '='.repeat((4 - (key.length % 4)) % 4); // Fix base64 padding
    const data = Buffer.from(paddedKey, 'base64').toString();
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
};

module.exports = { createPasskey, decodePasskey };
