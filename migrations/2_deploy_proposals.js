//let CertificatesPoolManager = artifacts.require("./CertificatesPoolManager.sol");
//let Library = artifacts.require("./Libraries/Library.sol");
let CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
let Library = artifacts.require("./Libraries/Library");

module.exports = async function(deployer, network, accounts){
    await deployer.deploy(Library);
    await deployer.link(Library, CertificatesPoolManager);
    await deployer.deploy(CertificatesPoolManager, [accounts[0]], 1, 10, 20);
    //await deployer.deploy(CertificatesPoolManager, 10, 20, {gas: 672197500});
}