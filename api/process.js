import { customAlphabet, nanoid } from 'nanoid';
import { createHash, randomBytes } from 'crypto';

// UUID v4 Generator
function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// UUID v7 Generator (timestamp-based, sortable)
function generateUUIDv7() {
  const timestamp = Date.now();
  const timeHex = timestamp.toString(16).padStart(12, '0');
  const random = randomBytes(10).toString('hex');
  return `${timeHex.slice(0, 8)}-${timeHex.slice(8)}-7${random.slice(0, 3)}-${random.slice(3, 7)}-${random.slice(7)}`;
}

// UUID v8 Generator (custom, vendor-specific)
function generateUUIDv8() {
  const custom = randomBytes(16).toString('hex');
  return `${custom.slice(0, 8)}-${custom.slice(8, 12)}-8${custom.slice(13, 16)}-${custom.slice(16, 20)}-${custom.slice(20)}`;
}

// UUID v1 Generator (timestamp + MAC address simulation)
function generateUUIDv1() {
  const timestamp = Date.now();
  const timeHex = timestamp.toString(16).padStart(12, '0');
  const clockSeq = Math.floor(Math.random() * 16384).toString(16).padStart(4, '0');
  const node = randomBytes(6).toString('hex');
  return `${timeHex.slice(0, 8)}-${timeHex.slice(8)}-1${clockSeq.slice(0, 3)}-${clockSeq.slice(3)}${node.slice(0, 2)}-${node.slice(2)}`;
}

// CUID Generator
function generateCUID() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  const counter = Math.floor(Math.random() * 10000).toString(36).padStart(4, '0');
  const fingerprint = randomBytes(4).toString('hex').slice(0, 4);
  return `c${timestamp}${counter}${random}${fingerprint}`;
}

// ULID Generator (Universally Unique Lexicographically Sortable Identifier)
function generateULID() {
  const encoding = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const timestamp = Date.now();
  let timePart = '';
  let ts = timestamp;
  for (let i = 0; i < 10; i++) {
    timePart = encoding[ts % 32] + timePart;
    ts = Math.floor(ts / 32);
  }
  let randomPart = '';
  for (let i = 0; i < 16; i++) {
    randomPart += encoding[Math.floor(Math.random() * 32)];
  }
  return timePart + randomPart;
}

// NanoID Generator with custom length
function generateNanoID(length = 21) {
  return nanoid(length);
}

// Apply format transformations
function formatID(id, format) {
  switch (format) {
    case 'uppercase':
      return id.toUpperCase();
    case 'lowercase':
      return id.toLowerCase();
    case 'nodashes':
      return id.replace(/-/g, '');
    case 'braces':
      return `{${id}}`;
    case 'parentheses':
      return `(${id})`;
    case 'urn':
      return `urn:uuid:${id}`;
    default:
      return id;
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type = 'uuidv4', count = 1, format = 'default', length } = req.body;

    // Validate count
    const numCount = Math.min(Math.max(parseInt(count) || 1, 1), 1000);

    const ids = [];
    for (let i = 0; i < numCount; i++) {
      let id;
      switch (type.toLowerCase()) {
        case 'uuidv4':
        case 'uuid-v4':
        case 'v4':
          id = generateUUIDv4();
          break;
        case 'uuidv7':
        case 'uuid-v7':
        case 'v7':
          id = generateUUIDv7();
          break;
        case 'uuidv8':
        case 'uuid-v8':
        case 'v8':
          id = generateUUIDv8();
          break;
        case 'uuidv1':
        case 'uuid-v1':
        case 'v1':
          id = generateUUIDv1();
          break;
        case 'nanoid':
        case 'nano':
          id = generateNanoID(length ? parseInt(length) : 21);
          break;
        case 'cuid':
        case 'cuid2':
          id = generateCUID();
          break;
        case 'ulid':
          id = generateULID();
          break;
        default:
          id = generateUUIDv4();
      }
      ids.push(formatID(id, format));
    }

    return res.status(200).json({
      success: true,
      type,
      count: numCount,
      format,
      ids,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('UUID Generation Error:', error);
    return res.status(500).json({
      error: 'Failed to generate IDs',
      message: error.message
    });
  }
}
