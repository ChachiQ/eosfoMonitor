import path from 'path';
var pwdFileName = path.format({ //the context path of last run
    dir: __dirname,
    base: '.pwd'
})
var pwd = JSON.parse(require('fs').readFileSync(pwdFileName));

module.exports = {
    name: 'eosnewyork',
    type: 'mainnet',
    writeable: true,
    endpoint: 'http://api.eosnewyork.io:80',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    wallet: pwd,
}