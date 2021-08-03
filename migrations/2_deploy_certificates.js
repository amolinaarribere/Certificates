let CertificatesPoolManager = artifacts.require("./DeployedContracts/CertificatesPoolManager");
let Provider = artifacts.require("./DeployedContracts/Provider");
let Treasury = artifacts.require("./DeployedContracts/Treasury");
let PublicCertificatesPool = artifacts.require("./DeployedContracts/PublicCertificatesPool");
let PrivateCertificatesPool = artifacts.require("./DeployedContracts/PrivateCertificatesPool");
let CertisToken = artifacts.require("./DeployedContracts/CertisToken");
let PrivatePoolGenerator = artifacts.require("./DeployedContracts/PrivatePoolGenerator");

let TreasuryProxy = artifacts.require("./DeployedContracts/Proxies/TreasuryProxy");
let PublicCertificatesPoolProxy = artifacts.require("./DeployedContracts/Proxies/PublicCertificatesPoolProxy");
let CertisTokenProxy = artifacts.require("./DeployedContracts/Proxies/CertisTokenProxy");
let PrivatePoolGeneratorProxy = artifacts.require("./DeployedContracts/Proxies/PrivatePoolGeneratorProxy");

let Library = artifacts.require("./Libraries/Library");
let UintLibrary = artifacts.require("./Libraries/UintLibrary");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");
let ItemsLibrary = artifacts.require("./Libraries/ItemsLibrary");

module.exports = async function(deployer, network, accounts){

    // Libraries -----------------------------------------------------------------------------------------------------------------------------------------------------------------
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

    await deployer.link(Library, ItemsLibrary);
    console.log("Library linked to Items Library");

    await deployer.link(AddressLibrary, ItemsLibrary);
    console.log("Address Library linked to Items Library");

    await deployer.deploy(ItemsLibrary);
    console.log("ItemsLibrary deployed");

    // Certificate Pool Manager -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    await deployer.link(Library, CertificatesPoolManager);
    console.log("Library linked to Certificate Pool Manager");

    await deployer.link(AddressLibrary, CertificatesPoolManager);
    console.log("AddressLibrary linked to Certificate Pool Manager");

    await deployer.deploy(CertificatesPoolManager, 604800, 50, 5);
    CertificatesPoolManagerInstance = await CertificatesPoolManager.deployed();
    console.log("certPoolManager deployed : " + CertificatesPoolManagerInstance.address);

    // Certis Token -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    await deployer.link(Library, CertisToken);
    console.log("Library linked to CertisToken");
 
    await deployer.link(AddressLibrary, CertisToken);
    console.log("AddressLibrary linked to CertisToken");
 
    //await deployer.deploy(CertisToken, "CertisToken", "CERT", 0, 1000000);
    await deployer.deploy(CertisToken);
    CertisTokenInstance = await CertisToken.deployed();
    console.log("CertisToken deployed : " + CertisTokenInstance.address);

    var CertisTokenProxyInitializerMethod = {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "decimalsValue",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "MaxSupply",
            "type": "uint256"
          }
        ],
        "name": "CertisToken_init",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      };
    var CertisTokenProxyInitializerParameters = ["CertisToken", "CERT", 0, 1000000];
    var CertisProxyData = web3.eth.abi.encodeFunctionCall(CertisTokenProxyInitializerMethod, CertisTokenProxyInitializerParameters);

    await deployer.deploy(CertisTokenProxy, CertisTokenInstance.address, CertificatesPoolManagerInstance.address, CertisProxyData);
    CertisTokenProxyInstance = await CertisTokenProxy.deployed();
    console.log("CertisTokenProxy deployed : " + CertisTokenProxyInstance.address);

   // Treasury -----------------------------------------------------------------------------------------------------------------------------------------------------------------
   await deployer.link(Library, Treasury);
   console.log("Library linked to Treasury");

   await deployer.link(UintLibrary, Treasury);
   console.log("UintLibrary linked to Treasury");

    await deployer.link(AddressLibrary, Treasury);
    console.log("AddressLibrary linked to Treasury");

    //await deployer.deploy(Treasury, 10, 20, 5, 2, CertificatesPoolManagerInstance.address, 604800, 50, 5);
    await deployer.deploy(Treasury);
    TreasuryInstance = await Treasury.deployed();
    console.log("Treasury deployed : " + TreasuryInstance.address);

    var TreasuryProxyInitializerMethod = {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "PublicPriceWei",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "PrivatePriceWei",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "CertificatePriceWei",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "OwnerRefundPriceWei",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "managerContractAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "PropositionLifeTime",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "PropositionThresholdPercentage",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "minWeightToProposePercentage",
          "type": "uint8"
        }
      ],
      "name": "Treasury_init",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    };
    var TreasuryProxyInitializerParameters = [ 10, 20, 5, 2, CertificatesPoolManagerInstance.address, 604800, 50, 5];
    var TreasuryProxyData = web3.eth.abi.encodeFunctionCall(TreasuryProxyInitializerMethod, TreasuryProxyInitializerParameters);

    await deployer.deploy(TreasuryProxy, TreasuryInstance.address, CertificatesPoolManagerInstance.address, TreasuryProxyData);
    TreasuryProxyInstance = await TreasuryProxy.deployed();
    console.log("TreasuryProxy deployed : " + TreasuryProxyInstance.address);

    // Private Pool -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    await deployer.link(Library, PrivateCertificatesPool);
    console.log("Library linked to PrivateCertificatesPool");

    await deployer.link(AddressLibrary, PrivateCertificatesPool);
    console.log("Address Library linked to PrivateCertificatesPool");

    await deployer.link(ItemsLibrary, PrivateCertificatesPool);
    console.log("Items Library linked to PrivateCertificatesPool");

    //await deployer.deploy(PrivateCertificatesPool, [accounts[0]],  1, CertificatesPoolManagerInstance.address);
    await deployer.deploy(PrivateCertificatesPool);
    PrivateCertificatesPoolInstance = await PrivateCertificatesPool.deployed();
    console.log("PrivateCertificatesPool deployed : " + PrivateCertificatesPoolInstance.address);

    // Private Pool Generator -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    await deployer.link(Library, PrivatePoolGenerator);
    console.log("Library linked to PrivatePoolGenerator");

    await deployer.link(AddressLibrary, PrivatePoolGenerator);
    console.log("AddressLibrary linked to PrivatePoolGenerator");

    await deployer.link(ItemsLibrary, PrivatePoolGenerator);
    console.log("ItemsLibrary linked to PrivatePoolGenerator");

    //await deployer.deploy(PrivatePoolGenerator, CertificatesPoolManagerInstance.address);
    await deployer.deploy(PrivatePoolGenerator);
    PrivatePoolGeneratorInstance = await PrivatePoolGenerator.deployed();
    console.log("PrivatePoolGenerator deployed : " + PrivatePoolGeneratorInstance.address);
    
    var PrivatePoolGeneratorProxyInitializerMethod = {
      "inputs": [
        {
          "internalType": "address",
          "name": "managerContractAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "PrivateCertificatePoolImplAddress",
          "type": "address"
        }
      ],
      "name": "PrivatePoolGenerator_init",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    };
    var PrivatePoolGeneratorProxyInitializerParameters = [CertificatesPoolManagerInstance.address, PrivateCertificatesPoolInstance.address];
    var PrivatePoolGeneratorProxyData = web3.eth.abi.encodeFunctionCall(PrivatePoolGeneratorProxyInitializerMethod, PrivatePoolGeneratorProxyInitializerParameters);

    await deployer.deploy(PrivatePoolGeneratorProxy, PrivatePoolGeneratorInstance.address, CertificatesPoolManagerInstance.address, PrivatePoolGeneratorProxyData);
    PrivatePoolGeneratorProxyInstance = await PrivatePoolGeneratorProxy.deployed();
    console.log("PrivatePoolGeneratorProxy deployed : " + PrivatePoolGeneratorProxyInstance.address);

    // Public Pool -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    await deployer.link(Library, PublicCertificatesPool);
    console.log("Library linked to PublicCertificatesPool");
 
    await deployer.link(AddressLibrary, PublicCertificatesPool);
    console.log("Address Library linked to PublicCertificatesPool");
 
    await deployer.link(ItemsLibrary, PublicCertificatesPool);
    console.log("Items Library linked to PublicCertificatesPool");
 
    //await deployer.deploy(PublicCertificatesPool, [accounts[0]],  1, CertificatesPoolManagerInstance.address);
    await deployer.deploy(PublicCertificatesPool);
    PublicCertificatesPoolInstance = await PublicCertificatesPool.deployed();
    console.log("PublicCertificatesPool deployed : " + PublicCertificatesPoolInstance.address);
 
    var PublicCertificatesPoolProxyInitializerMethod = {
       "inputs": [
         {
           "internalType": "address[]",
           "name": "owners",
           "type": "address[]"
         },
         {
           "internalType": "uint256",
           "name": "minOwners",
           "type": "uint256"
         },
         {
           "internalType": "address",
           "name": "managerContractAddress",
           "type": "address"
         }
       ],
       "name": "PublicCertPool_init",
       "outputs": [],
       "stateMutability": "nonpayable",
       "type": "function"
    };
    var PublicCertificatesPoolProxyInitializerParameters = [[accounts[0]], 1, CertificatesPoolManagerInstance.address];
    var PublicCertificatesPoolProxyData = web3.eth.abi.encodeFunctionCall(PublicCertificatesPoolProxyInitializerMethod, PublicCertificatesPoolProxyInitializerParameters);
 
    await deployer.deploy(PublicCertificatesPoolProxy, PublicCertificatesPoolInstance.address, CertificatesPoolManagerInstance.address, PublicCertificatesPoolProxyData);
    PublicCertificatesPoolProxyInstance = await PublicCertificatesPoolProxy.deployed();
    console.log("PublicCertificatesPoolProxy deployed : " + PublicCertificatesPoolProxyInstance.address);

    // Initialized Manager -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    await CertificatesPoolManagerInstance.InitializeContracts(PublicCertificatesPoolProxyInstance.address, TreasuryProxyInstance.address, CertisTokenProxyInstance.address, PrivatePoolGeneratorProxyInstance.address);
    console.log("CertificatesPoolManager initialized");

    // Provider -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    await deployer.link(Library, Provider);
    console.log("Library linked to Provider");

    await deployer.link(AddressLibrary, Provider);
    console.log("AddressLibrary linked to Provider");

    await deployer.link(ItemsLibrary, Provider);
    console.log("ItemsLibrary linked to Provider");

    await deployer.deploy(Provider, [accounts[0]], 1, "Provider Info");
    console.log("Provider deployed");
    
}