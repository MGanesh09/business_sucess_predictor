const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return [];
  }
};

const writeData = (collection, data) => {
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const MockDb = {
  find: (collection, query = {}) => {
    const data = readData(collection);
    return data.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },
  findOne: (collection, query = {}) => {
    const results = MockDb.find(collection, query);
    return results.length > 0 ? results[0] : null;
  },
  findById: (collection, id) => {
    const data = readData(collection);
    return data.find(item => item.id === id || item._id === id) || null;
  },
  create: (collection, item) => {
    const data = readData(collection);
    const newItem = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      ...item
    };
    data.push(newItem);
    writeData(collection, data);
    return newItem;
  },
  update: (collection, id, updates) => {
    const data = readData(collection);
    const index = data.findIndex(item => item.id === id || item._id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      writeData(collection, data);
      return data[index];
    }
    return null;
  },
  delete: (collection, id) => {
    const data = readData(collection);
    const filtered = data.filter(item => item.id !== id && item._id !== id);
    writeData(collection, filtered);
    return true;
  }
};

module.exports = MockDb;
