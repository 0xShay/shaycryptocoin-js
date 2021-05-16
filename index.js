const Web3 = require(`web3`);
const fetch = require(`node-fetch`);
const EventEmitter = require(`events`);

let poolAddr = `0x83c8ebA017b302aa7AdC6341FFf02F0b52Bbb6F7`; // token-LP
let token1_Addr = `0x4df3725e670da0f07a8723b7b059b1cae857f8ac`; // token
let token2_Addr = `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`; // WBNB

let token1;
let token2;

// const emitter = new EventEmitter();

// let contractAddress = "TTP81ruqBGfSmh2raNV4uf4btgUxkKnfti";

// async function eventListeners() {
    
//     let tokenSCCN = await tronWeb.contract().at(contractAddress);
    
//     tokenSCCN.Transfer().watch((err, res) => {
//         emitter.emit(`transfer`, (err, res));
//     });

//     tokenSCCN.Approval().watch((err, res) => {
//         emitter.emit(`approval`, (err, res));
//     });

//     tokenSCCN.Burn().watch((err, res) => {
//         emitter.emit(`burn`, (err, res));
//     });
    
// };

let tokenABI = [
    // balanceOf
    {
        "constant":true,
        "inputs":[{"name":"_owner","type":"address"}],
        "name":"balanceOf",
        "outputs":[{"name":"balance","type":"uint256"}],
        "type":"function"
    },
    {
        "constant":true,
        "inputs":[
            
        ],
        "name":"totalSupply",
        "outputs":[
            {
                "name":"",
                "type":"uint256"
            }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
   },
        {
        "constant":true,
        "inputs":[
            {
                "name":"",
                "type":"address"
            },
            {
                "name":"",
                "type":"address"
            }
        ],
        "name":"allowance",
        "outputs":[
            {
                "name":"",
                "type":"uint256"
            }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
    }
];

// eventListeners();

async function init() {

    // web3 = new Web3('wss://dex.binance.org/api/ws/bnb1m4m9etgf3ca5wpgkqe5nr6r33a4ynxfln3yz4v');
    web3 = new Web3('https://bsc-dataseed1.binance.org:443');

    token1 = await new web3.eth.Contract(tokenABI, token1_Addr);
    token2 = await new web3.eth.Contract(tokenABI, token2_Addr);

}

init();

async function getPrice() {

    let ethUsd = 1;
	let ethPrice;
	let res;

	ethUsd = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`);
    ethUsd = await ethUsd.json();
    ethUsd = ethUsd["binancecoin"]["usd"];

    // token
    tokenBal = await token1.methods.balanceOf(poolAddr).call({}, (err, bal) => {
        if (err) console.log(err);
        return bal;
    });

    // WBNB
    baseBal = await token2.methods.balanceOf(poolAddr).call({}, (err, bal) => {
        if (err) console.log(err);
        return bal;
    });

    ethPrice = (parseFloat(baseBal) / 1e18) / (parseFloat(tokenBal) / 1e9); // main

	dollarPrice = ethPrice * ethUsd;

    return ethPrice;

};

async function getTotalSupply() {

    token1 = await new web3.eth.Contract(tokenABI, token1_Addr);

    let totalSupply = await token1.methods.totalSupply().call();
    return (totalSupply / 1e9);

};

async function getBalanceOf(address) {

    let userBalance = await token1.methods.balanceOf(address).call();
    return (userBalance / 1e9);

};

async function getAllowance(allower, sender) {

    let allowance = await token1.methods.allowance(allower, sender).call();
    return (allowance / 1e9);

};

let toExport = {
    getPrice: async function (ticker) {
        ticker = ticker.toLowerCase();
        
        let eSCCNBNB = await getPrice();
        if (ticker == `bnb`) return eSCCNBNB;

        cgPriceFetch = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${ticker}`).then(res => res.json());
        let eBNBUSD = cgPriceFetch.binancecoin[ticker];

        if (!eBNBUSD) return 0;

        let eSCCNUSD = eSCCNBNB * eBNBUSD;

        return eSCCNUSD;
    },
    totalSupply: async function () {

        let totalSupply = await getTotalSupply();

        return parseFloat(totalSupply);

    },
    balanceOf: async function (address) {

        let balanceOf = await getBalanceOf(address);

        return parseFloat(balanceOf);
        
    },
    allowance: async function (allower, sender) {

        let allowance = await getAllowance(allower, sender).call();

        return parseFloat(allowance);

    }
    // events: emitter
};

module.exports = toExport;