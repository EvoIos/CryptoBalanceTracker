const sqlite3 = require('sqlite3').verbose();
// const data = [
//   {
//     id: "usd-bancor",
//     symbol: "usdb",
//     name: "USD Bancor",
//     platforms: {
//       ethereum: "0x309627af60f0926daa6041b8279484312f2bf060",
//     },
//   }
// ];

const { data } = require('./coin_lists')



const createTableQuery = `
CREATE TABLE IF NOT EXISTS cryptocurrencies (
  id TEXT PRIMARY KEY,
  symbol TEXT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS platforms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_name TEXT,
  contract_address TEXT,
  crypto_id TEXT,
  FOREIGN KEY (crypto_id) REFERENCES cryptocurrencies (id)
);
`;

const insertCryptoQuery = `
INSERT INTO cryptocurrencies (id, symbol, name) VALUES (?, ?, ?);
`;

const insertPlatformQuery = `
INSERT INTO platforms (platform_name, contract_address, crypto_id) VALUES (?, ?, ?);
`;

const db = new sqlite3.Database('./cryptocurrencies.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');

  db.serialize(() => {
    // Create tables
    db.exec(createTableQuery, (err) => {
      if (err) {
        console.error(err.message);
      }

      // here
      console.log('Tables created.');

      // Insert data
      data.forEach((crypto) => {
            // Insert cryptocurrency data
            db.run(insertCryptoQuery, [crypto.id, crypto.symbol, crypto.name], (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log(`Inserted crypto: ${crypto.id}`);
        
            // Insert platform data
            Object.entries(crypto.platforms).forEach(([platform_name, contract_address]) => {
                db.run(insertPlatformQuery, [platform_name, contract_address, crypto.id], (err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log(`Inserted platform: ${platform_name} for crypto: ${crypto.id}`);
                });
            });
            });
        });
    });
  });

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
  });
});
