const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
// const cron = require('node-cron');

const db = new sqlite3.Database('./cryptocurrencies.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

async function getPriceByIds(ids) {
  try {
    const encodeDot = encodeURIComponent(',');
    const idsMapped = ids.join(encodeDot);
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsMapped}&vs_currencies=usd`;
    console.log(url)
    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.error(err.message);
    return null;
  }
}

function getAllIds(callback) {
    db.all('SELECT id FROM cryptocurrencies', [], (err, rows) => {
      if (err) {
        console.error(err.message);
        callback(null);
      } else {
        let ids = rows.map(row => row.id);
        ids = ids.slice(0, 2);
        callback(ids);
      }
    });
  }
  

  async function updatePrices() {
    getAllIds(async (ids) => {
      if (ids) {
        const prices = await getPriceByIds(ids);
        if (prices) {
          ids.forEach(id => {
            const price = prices[id].usd;
            db.run('UPDATE cryptocurrencies SET price = ? WHERE id = ?', [price, id], (err) => {
              if (err) {
                console.error(err.message);
              } else {
                console.log(`Updated price for ${id}: ${price}`);
              }
            });
          });
        }
      }
    });
  }
  
  updatePrices();
  // Schedule the task to run every 5 minutes
//   cron.schedule('*/5 * * * *', () => {
//     updatePrices();
//   });
  