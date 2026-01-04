const conexao = require('mysql2');
const db = conexao.createPool({
    host: 'localhost',
    user:  'root',
    password: 'password',
    database: 'model_site'
});
module.exports = db;
