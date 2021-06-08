//let CertificatesPoolManager = artifacts.require("./CertificatesPoolManager.sol");
//let Library = artifacts.require("./Libraries/Library.sol");
let CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
let Library = artifacts.require("./Libraries/Library");

module.exports = async function(deployer){
    await deployer.deploy(Library);
    await deployer.link(Library, CertificatesPoolManager);
    //await deployer.deploy(CertificatesPoolManager, ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"], 1, 0, 0, {gas: 3000000});
}