const PlatformSettings = require('../models/PlatformSettings');

const getAll = async () => {
  const docs = await PlatformSettings.find().lean();
  const settings = {};
  docs.forEach((doc) => {
    settings[doc.key] = doc.value;
  });
  return settings;
};

const update = async (data) => {
  const keys = Object.keys(data);
  const ops = keys.map((key) => ({
    updateOne: {
      filter: { key },
      update: { key, value: data[key], updatedAt: new Date() },
      upsert: true,
    },
  }));
  await PlatformSettings.bulkWrite(ops);
  return getAll();
};

module.exports = { getAll, update };
