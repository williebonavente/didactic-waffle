const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL;

async function main() {
    await mongoose.connect(MONGODB_URL);

    const result = await mongoose.connection.db.collection('images').updateMany(
        { hidden: { $exists: false } },
        { $set: { hidden: false } }
    )

    console.log(`Update ${result.modifiedCount} image(s).`);
    await mongoose.disconnect();
}

main().catch(console.error);