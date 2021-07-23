let CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
let Provider = artifacts.require("Provider");
let Treasury = artifacts.require("Treasury");
let PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
let CertisToken = artifacts.require("CertisToken");
let PrivatePoolGenerator = artifacts.require("PrivatePoolGenerator");

let Library = artifacts.require("./Libraries/Library");
let UintLibrary = artifacts.require("./Libraries/UintLibrary");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");

module.exports = async function(deployer, network, accounts){

    // Libraries
    await deployer.deploy(Library);
    console.log("Library deployed");

    await deployer.link(Library, UintLibrary);
    console.log("Library linked to Uint Library");

    await deployer.deploy(UintLibrary);
    console.log("UintLibrary deployed");

    await deployer.link(Library, AddressLibrary);
    console.log("Library linked to Address Library");

    await deployer.deploy(AddressLibrary);
    console.log("AddressLibrary deployed");

    // Certificate Pool Manager
    await deployer.link(Library, CertificatesPoolManager);
    console.log("Library linked to Certificate Pool Manager");

    await deployer.link(AddressLibrary, CertificatesPoolManager);
    console.log("AddressLibrary linked to Certificate Pool Manager");

    await deployer.deploy(CertificatesPoolManager, 604800, 50, 5);
    CertificatesPoolManagerInstance = await CertificatesPoolManager.deployed();
    console.log("certPoolManager deployed : " + CertificatesPoolManagerInstance.address);

    // Certis Token
    await deployer.link(Library, CertisToken);
    console.log("Library linked to CertisToken");
 
    await deployer.link(AddressLibrary, CertisToken);
    console.log("AddressLibrary linked to CertisToken");
 
    await deployer.deploy(CertisToken, "CertisToken", "CERT", 0, 1000000);
    CertisTokenInstance = await CertisToken.deployed();
    console.log("CertisToken deployed : " + CertisTokenInstance.address);

    // Public Pool
    await deployer.link(Library, PublicCertificatesPool);
    console.log("Library linked to PublicCertificatesPool");

    await deployer.deploy(PublicCertificatesPool, [accounts[0]],  1, CertificatesPoolManagerInstance.address);
    PublicCertificatesPoolInstance = await PublicCertificatesPool.deployed();
    console.log("PublicCertificatesPool deployed : " + PublicCertificatesPoolInstance.address);

    // Treasury
    await deployer.link(UintLibrary, Treasury);
    console.log("UintLibrary linked to Treasury");

    await deployer.deploy(Treasury, 10, 20, 5, 2, CertificatesPoolManagerInstance.address, 604800, 50, 5);
    TreasuryInstance = await Treasury.deployed();
    console.log("Treasury deployed : " + TreasuryInstance.address);

    // Private Pool Generator
    await deployer.link(Library, PrivatePoolGenerator);
    console.log("Library linked to PrivatePoolGenerator");

    await deployer.deploy(PrivatePoolGenerator, CertificatesPoolManagerInstance.address);
    PrivatePoolGeneratorInstance = await PrivatePoolGenerator.deployed();
    console.log("PrivatePoolGenerator deployed : " + PrivatePoolGeneratorInstance.address);
    

    // Initialized Manager
    await CertificatesPoolManagerInstance.Initialize(PublicCertificatesPoolInstance.address, TreasuryInstance.address, CertisTokenInstance.address, PrivatePoolGeneratorInstance.address);
    console.log("CertificatesPoolManager initialized");

    // Provider
    await deployer.link(Library, Provider);
    console.log("Library linked to Provider");

    await deployer.deploy(Provider, [accounts[0]], 1, "Provider Info");
    console.log("Provider deployed");
    
}