// One-time cleanup after removing the host feature.
// Run from the Backend folder:  node scripts/removeHostData.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await mongoose.connection.collection('users')
    .updateMany({role: 'host'}, {$set: {role: 'user'}});
  const props = await mongoose.connection.collection('properties')
    .updateMany({host: {$exists: true}}, {$unset: {host: ''}});
  console.log(`users host->user: ${users.modifiedCount}, properties host field removed: ${props.modifiedCount}`);
  await mongoose.disconnect();
})();
