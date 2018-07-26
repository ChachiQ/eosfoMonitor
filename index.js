require('console-stamp')(console, {
    pattern: 'yyyy/mm/dd HH:MM:ss',
    label: false,
    colors: {
        stamp: 'yellow',
        label: 'white',
    }
});
var appRoot = require('app-root-path');

const eosHelper = require('./eos/eosHelper');
const config = require(appRoot + "/config");
const eos = eosHelper.Eos(config);
const moment = require('moment');

const F3D_CONTACT_NAME = "eosfoiowolfs";
const CURRENT_ROUND = 1;
const MY_ACCOUNT = config.wallet.defaultAccount;


async function getRoundState() {
    let res = await eos.getTableRows({
        json: true,
        code: F3D_CONTACT_NAME,
        scope: F3D_CONTACT_NAME,
        table: "games",
        lower_bound: CURRENT_ROUND,
        limit: 1
    });
    // { number: 1,
    //    total_prize_pool: '93912.9309 EOS',
    //    participant_count: 124,
    //    ico_time:   1532358328,
    //    start_time: 1532412580,
    //    lottery_time: 1532434180,
    //    winner: 'llllllllllky',
    //    winning_team: 'hunter',
    //    locked: 0,
    //    keys: 5763134 
    // }
    return res.rows[0];
}

async function withdraw(account) {
    let contract = await eos.contract(F3D_CONTACT_NAME);
    try {
        let result = await contract.withdraw(account, {
            authorization: [`${account}@active`]
        })
        console.log("\n withdraw success");
        console.log(result);
    } catch (err) {
        console.log(JSON.parse(err).error.details[0].message);
    }
}

async function betKeys(account, count) {
    let contract = await eos.contract(F3D_CONTACT_NAME);

    try {
        let result = await contract.buykey({
            buyer: account,
            team: "hunter",
            keys: count
        }, {
            authorization: [`${account}@active`]
        })
        console.log("\n bought success");
        console.log(result);
    } catch (err) {
        console.log("\n buy key failed.")
        console.log(JSON.parse(err).error.details[0].message);
    }
}

async function main() {
    while (true) {
        let state = await getRoundState();
        let now = Date.now() / 1000;
        if (now > state.lottery_time) {
            console.log(`\n\n\n !!!!!!!GAME of round ${CURRENT_ROUND} finished!!!!!!!!`);
            if (state.winner === MY_ACCOUNT) {
                console.log("\n Congratulation, you are the winner !!!! \n\n");
                withdraw(MY_ACCOUNT);
            } else {
                console.log("Bad Luck, you are not the winner.");
            }
            return;
        } else if (now < state.start_time) {
            console.log(`GAME of roun ${CURRENT_ROUND} not start yet, wait a moment...`);
            await sleep(30000);
            continue;
        } else if (state.lottery_time - now <= 20) {
            if (state.winner !== MY_ACCOUNT) {
                console.log(`\n\n\n!!!!! GAME will finished, ready to show hand !!!!!!`);
                betKeys(MY_ACCOUNT, 1);
                await sleep(2000)
            } else {
                console.log(`until now, you are the winner!!!`);
                await sleep(5000);
            }
        } else {
            let leave = state.lottery_time - now;
            console.log(`\n Game remain: ${moment.duration(leave,'seconds').humanize(true)}\n`)
            console.log('Current Game State:')
            console.log(state);
            console.log("\n")
            if (leave >= 3600) {
                await sleep(10 * 60 * 1000)
            } else {
                await sleep(30 * 1000);
            }
        }
    }
}

async function buy_once() {
    let state = await getRoundState();
    let now = Date.now() / 1000;
    if (now > state.lottery_time) {
        console.log(`\n\n\n !!!!!!!GAME of round ${CURRENT_ROUND} finished!!!!!!!!`);
        if (state.winner === MY_ACCOUNT) {
            console.log("\n Congratulation, you are the winner !!!! \n\n");
            withdraw(MY_ACCOUNT);
        } else {
            console.log("Bad Luck, you are not the winner.");
        }
        return;
    } else if (now < state.start_time) {
        console.log(`GAME of roun ${CURRENT_ROUND} not start yet, wait a moment...`);
    } else if (state.lottery_time - now <= 20) {
        if (state.winner !== MY_ACCOUNT) {
            console.log(`\n\n\n!!!!! GAME will finished, ready to show hand !!!!!!`);
            betKeys(MY_ACCOUNT, 1);
        } else {
            console.log(`until now, you are the winner!!!`);
        }
    } else {
        let leave = state.lottery_time - now;
        console.log(`\n Game remain: ${moment.duration(leave, 'seconds').humanize(true)}\n`)
        console.log('Current Game State:')
        console.log(state);
        console.log("\n")
    }
}

main();
//betKeys(MY_ACCOUNT, 99999)
//withdraw(MY_ACCOUNT);
//buy_once();

function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}
