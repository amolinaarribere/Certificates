let CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
let Provider = artifacts.require("Provider");
let Treasury = artifacts.require("Treasury");
let PublicCertificatesPool = artifacts.require("PublicCertificatesPool");

let Library = artifacts.require("./Libraries/Library");
let UintLibrary = artifacts.require("./Libraries/UintLibrary");

module.exports = async function(deployer, network, accounts){
    await deployer.deploy(Library);
    console.log("Library deployed");

    await deployer.link(Library, UintLibrary);
    console.log("Library linked to Uint Library");

    await deployer.deploy(UintLibrary);
    console.log("UintLibrary deployed");

    await deployer.link(Library, CertificatesPoolManager);
    console.log("Library linked to Certificate Pool Manager");

    await deployer.deploy(CertificatesPoolManager);
    CertificatesPoolManagerInstance = await CertificatesPoolManager.deployed();
    console.log("certPoolManager deployed : " + CertificatesPoolManagerInstance.address);

    await deployer.link(Library, PublicCertificatesPool);
    console.log("Library linked to PublicCertificatesPool");

    await deployer.deploy(PublicCertificatesPool, [accounts[0]],  1, CertificatesPoolManagerInstance.address);
    PublicCertificatesPoolInstance = await PublicCertificatesPool.deployed();
    console.log("PublicCertificatesPool deployed : " + PublicCertificatesPoolInstance.address);

    await deployer.link(UintLibrary, Treasury);
    console.log("UintLibrary linked to Treasury");

    await deployer.deploy(Treasury, 10, 20, 5, 2, PublicCertificatesPoolInstance.address, CertificatesPoolManagerInstance.address);
    TreasuryInstance = await Treasury.deployed();
    console.log("Treasury deployed : " + TreasuryInstance.address);

    await CertificatesPoolManagerInstance.Initialize(PublicCertificatesPoolInstance.address, TreasuryInstance.address);

    await deployer.link(Library, Provider);
    console.log("Library linked to Provider");

    await deployer.deploy(Provider, [accounts[0]], 1, "Provider Info");
    console.log("Provider deployed");
    
}