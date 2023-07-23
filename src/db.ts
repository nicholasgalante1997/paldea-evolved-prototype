import mysql from 'mysql';

class DatabaseManager {
  _config: mysql.ConnectionConfig;

  constructor(config: mysql.ConnectionConfig) {
    this._config = config;
  }

  connect(): mysql.Connection {
    return mysql.createConnection(this._config);
  }

  async query(query: string, values?: string[]): Promise<mysql.Query | null> {
    try {
      const connection = this.connect();
      if (values) {
        const queryResult: mysql.Query = await new Promise((resolve, reject) => {
          connection.query(query, values, (err, results, fields) => {
            if (err) {
              console.log(err.message);
              connection.end();
              throw new Error(err.message);
            }
            resolve(results);
          });
        });

        connection.end();
        return queryResult;
      }

      const queryResult: mysql.Query = await new Promise((resolve, reject) => {
        connection.query(query, (err, results, fields) => {
          if (err) {
            console.log(err.message);
            connection.end();
            throw new Error(err.message);
          }
          resolve(results);
        });
      });
      connection.end();
      return queryResult;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export const db = new DatabaseManager({
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'paldea',
  host: 'paldea_mysql_db',
  port: 3306,
})

export function checkForTables() {
  try {

  } catch (e) {
    
  }
}