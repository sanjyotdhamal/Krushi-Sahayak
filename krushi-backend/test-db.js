// test-db.js — Check MongoDB data
require('dotenv').config();
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');
const Application = require('./models/Application');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check farmers
    const farmers = await Farmer.find({});
    console.log(`\n👨‍🌾 Total Farmers in DB: ${farmers.length}`);
    farmers.forEach(f => {
      console.log(`  - ${f.name} (${f.farmerId}) - Mobile: ${f.mobile}`);
    });

    // Check applications
    const apps = await Application.find({});
    console.log(`\n📋 Total Applications in DB: ${apps.length}`);
    apps.forEach(a => {
      console.log(`  - ${a.appId}: ${a.schemeName} (${a.status}) - Farmer: ${a.farmerName}`);
    });

    console.log('\n📊 Sample Application Data:');
    if (apps.length > 0) {
      console.log(JSON.stringify(apps[0], null, 2));
    }

    await mongoose.connection.close();
    console.log('\n✅ Database check complete');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkData();
