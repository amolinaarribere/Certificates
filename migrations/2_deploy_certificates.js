let CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
let Provider = artifacts.require("Provider");
let Library = artifacts.require("./Libraries/Library");

module.exports = async function(deployer, network, accounts){
    await deployer.deploy(Library);
    await deployer.link(Library, CertificatesPoolManager);
    await deployer.deploy(CertificatesPoolManager, [accounts[0]], 1, 10, 20);
    await deployer.link(Library, Provider);
    await deployer.deploy(Provider, [accounts[0]], 1);
}