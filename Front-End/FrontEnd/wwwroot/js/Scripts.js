/*const Web3 = require('web3');

function LoadCertificatesConfiguration() {

    const provider = window.ethereum.provider;
    const web3 = new Web3(provider);

    var PublicAddress = document.getElementById('PublicAddress');
    var ChairPerson = document.getElementById('ChairPerson');
    var Balance = document.getElementById('Balance');

    PublicAddress.innerHTML = "Test Worked";
    ChairPerson.innerHTML = "Test Worked";
    Balance.innerHTML = "Test Worked ETH";
}*/

requirejs(["web3"], function LoadCertificatesConfiguration (web3) {
    const provider = window.ethereum.provider;
    const Web3 = new web3(provider);

    var PublicAddress = document.getElementById('PublicAddress');
    var ChairPerson = document.getElementById('ChairPerson');
    var Balance = document.getElementById('Balance');

    PublicAddress.innerHTML = "Test Worked";
    ChairPerson.innerHTML = "Test Worked";
    Balance.innerHTML = "Test Worked ETH";
});