let fs = require("fs");
let Web3 = require("web3");

let web3 = new Web3();
web3.setProvider(
    new web3.providers.HttpProvider("http://localhost:8545")
);

let contractAddress = "";
let fromAddress = "0x92f9563997d90E8A35A2A022b53171e95a00739f";

let abiStr = fs.readFileSync("Proposals.json", "utf8");
let abi = JSON.parse(abiStr);

let Proposals = new web3.eth.Contract(abi, contractAddress);