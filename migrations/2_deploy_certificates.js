let CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
let Provider = artifacts.require("Provider");
let Treasury = artifacts.require("Treasury");
let Library = artifacts.require("./Libraries/Library");

module.exports = async function(deployer, network, accounts){
    await deployer.deploy(Library);
    await deployer.link(Library, CertificatesPoolManager);
    console.log("linked");
    var gas = await CertificatesPoolManager.new.estimateGas();
    console.log("GAS Here : " + gas);
    await deployer.deploy(CertificatesPoolManager);
    await CertificatesPoolManager.Initialize([accounts[0]], 1,  10, 20, 2);
    await deployer.link(Library, Provider);
    await deployer.deploy(Provider, [accounts[0]], 1);
    
    
}