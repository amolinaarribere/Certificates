let CertificatesPoolManager = artifacts.require("./DeployedContracts/CertificatesPoolManager");
let Provider = artifacts.require("./DeployedContracts/Provider");
let Treasury = artifacts.require("./DeployedContracts/Treasury");
let PublicCertificatesPool = artifacts.require("./DeployedContracts/PublicCertificatesPool");
let PrivateCertificatesPool = artifacts.require("./DeployedContracts/PrivateCertificatesPool");
let CertisToken = artifacts.require("./DeployedContracts/CertisToken");
let PrivatePoolFactory = artifacts.require("./DeployedContracts/PrivatePoolFactory");
let ProviderFactory = artifacts.require("./DeployedContracts/ProviderFactory");
let PriceConverter = artifacts.require("./DeployedContracts/PriceConverter");
let ChainLinkRegistryAddress = "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"
// only for testing
let MockChainLinkFeedRegistry = artifacts.require("./DeployedContracts/Mock/MockChainLinkFeedRegistry");


const obj = require("../test_libraries/objects.js");

let Library = artifacts.require("./Libraries/Library");
let UintLibrary = artifacts.require("./Libraries/UintLibrary");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");
let ItemsLibrary = artifacts.require("./Libraries/ItemsLibrary");

const PropositionLifeTime = 604800;
const PropositionThresholdPercentage = 50;
const minWeightToProposePercentage = 5;
const TokenName = "CertisToken";
const TokenSymbol = "CERT";
const TokenSupply = 100000000;
const TokenDecimals = 0;
const PublicPriceUSD = 10000;
const PrivatePriceUSD = 200;
const ProviderPriceUSD = 250;
const CertificatePriceUSD = 1000;
const OwnerRefundFeeUSD = 2000;
const factor = 1000;
const PublicMinOwners = 1;


module.exports = async function(deployer, network, accounts){

  if("development" == network || 
  "ganache" == network )
  {
    await deployer.deploy(MockChainLinkFeedRegistry, factor);
    MockChainLinkFeedRegistryInstance = await MockChainLinkFeedRegistry.deployed();
    console.log("MockChainLinkFeedRegistry deployed : " + MockChainLinkFeedRegistryInstance.address);
    ChainLinkRegistryAddress = MockChainLinkFeedRegistryInstance.address
  }
  else if("Kovan" == network)
  {
    ChainLinkRegistryAddress = "0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0"
  }

  const PublicOwners = [accounts[0]];

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

  await deployer.deploy(CertificatesPoolManager, PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage);
  CertificatesPoolManagerInstance = await CertificatesPoolManager.deployed();
  console.log("certPoolManager deployed : " + CertificatesPoolManagerInstance.address);

  // Price Converter -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.deploy(PriceConverter);
  PriceConverterInstance = await PriceConverter.deployed();
  console.log("PriceConverter deployed : " + PriceConverterInstance.address);

  var PriceConverterProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "_registry",
        "type": "address"
      }
    ],
    "name": "PriceConverter_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };
  var PriceConverterProxyInitializerParameters = [ChainLinkRegistryAddress];
  var PriceConverterProxyData = web3.eth.abi.encodeFunctionCall(PriceConverterProxyInitializerMethod, PriceConverterProxyInitializerParameters);

  // Certis Token -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, CertisToken);
  console.log("Library linked to CertisToken");

  await deployer.link(AddressLibrary, CertisToken);
  console.log("AddressLibrary linked to CertisToken");

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
        "internalType": "uint256",
        "name": "MaxSupply",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "decimalsValue",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "name": "CertisToken_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };
  var CertisTokenProxyInitializerParameters = [TokenName, TokenSymbol, TokenSupply, CertificatesPoolManagerInstance.address, TokenDecimals, accounts[0]];
  var CertisProxyData = web3.eth.abi.encodeFunctionCall(CertisTokenProxyInitializerMethod, CertisTokenProxyInitializerParameters);

  // Treasury -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, Treasury);
  console.log("Library linked to Treasury");

  await deployer.link(UintLibrary, Treasury);
  console.log("UintLibrary linked to Treasury");

  await deployer.link(AddressLibrary, Treasury);
  console.log("AddressLibrary linked to Treasury");

  await deployer.deploy(Treasury);
  TreasuryInstance = await Treasury.deployed();
  console.log("Treasury deployed : " + TreasuryInstance.address);

  var TreasuryProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "PublicPriceUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "PrivatePriceUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "ProviderPriceUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "CertificatePriceUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "OwnerRefundFeeUSD",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "chairPerson",
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

  var TreasuryProxyInitializerParameters = [PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundFeeUSD, CertificatesPoolManagerInstance.address, accounts[0], PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage];
  var TreasuryProxyData = web3.eth.abi.encodeFunctionCall(TreasuryProxyInitializerMethod, TreasuryProxyInitializerParameters);

  // Private Pool -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PrivateCertificatesPool);
  console.log("Library linked to PrivateCertificatesPool");

  await deployer.link(AddressLibrary, PrivateCertificatesPool);
  console.log("Address Library linked to PrivateCertificatesPool");

  await deployer.link(ItemsLibrary, PrivateCertificatesPool);
  console.log("Items Library linked to PrivateCertificatesPool");

  await deployer.deploy(PrivateCertificatesPool);
  PrivateCertificatesPoolInstance = await PrivateCertificatesPool.deployed();
  console.log("PrivateCertificatesPool deployed : " + PrivateCertificatesPoolInstance.address);

  // Private Pool Factory -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PrivatePoolFactory);
  console.log("Library linked to PrivatePoolFactory");

  await deployer.deploy(PrivatePoolFactory);
  PrivatePoolFactoryInstance = await PrivatePoolFactory.deployed();
  console.log("PrivatePoolFactory deployed : " + PrivatePoolFactoryInstance.address);
  
  var PrivatePoolFactoryProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      }
    ],
    "name": "PrivatePoolFactory_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };
  var PrivatePoolFactoryProxyInitializerParameters = [CertificatesPoolManagerInstance.address];
  var PrivatePoolFactoryProxyData = web3.eth.abi.encodeFunctionCall(PrivatePoolFactoryProxyInitializerMethod, PrivatePoolFactoryProxyInitializerParameters);

  // Public Pool -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PublicCertificatesPool);
  console.log("Library linked to PublicCertificatesPool");

  await deployer.link(AddressLibrary, PublicCertificatesPool);
  console.log("Address Library linked to PublicCertificatesPool");

  await deployer.link(ItemsLibrary, PublicCertificatesPool);
  console.log("Items Library linked to PublicCertificatesPool");

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
  var PublicCertificatesPoolProxyInitializerParameters = [PublicOwners, PublicMinOwners, CertificatesPoolManagerInstance.address];
  var PublicCertificatesPoolProxyData = web3.eth.abi.encodeFunctionCall(PublicCertificatesPoolProxyInitializerMethod, PublicCertificatesPoolProxyInitializerParameters);

  // Provider -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, Provider);
  console.log("Library linked to Provider");

  await deployer.link(AddressLibrary, Provider);
  console.log("Address Library linked to Provider");

  await deployer.link(ItemsLibrary, Provider);
  console.log("Items Library linked to Provider");

  await deployer.deploy(Provider);
  ProviderInstance = await Provider.deployed();
  console.log("Provider deployed : " + ProviderInstance.address);

  // Provider Factory -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, ProviderFactory);
  console.log("Library linked to ProviderFactory");

  await deployer.deploy(ProviderFactory);
  ProviderFactoryInstance = await ProviderFactory.deployed();
  console.log("ProviderFactory deployed : " + ProviderFactoryInstance.address);
  
  var ProviderFactoryProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      }
    ],
    "name": "ProviderFactory_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };
  var ProviderFactoryProxyInitializerParameters = [CertificatesPoolManagerInstance.address];
  var ProviderFactoryProxyData = web3.eth.abi.encodeFunctionCall(ProviderFactoryProxyInitializerMethod, ProviderFactoryProxyInitializerParameters);

  // Initialized Manager -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await CertificatesPoolManagerInstance.InitializeContracts(
    obj.returnUpgradeObject(PublicCertificatesPoolInstance.address,
       TreasuryInstance.address,
        CertisTokenInstance.address, 
        PrivatePoolFactoryInstance.address, 
        PrivateCertificatesPoolInstance.address, 
        ProviderFactoryInstance.address, 
        ProviderInstance.address, 
        PriceConverterInstance.address,
        PublicCertificatesPoolProxyData, 
        TreasuryProxyData, 
        CertisProxyData, 
        PrivatePoolFactoryProxyData, 
        ProviderFactoryProxyData, 
        PriceConverterProxyData));
  console.log("CertificatesPoolManager initialized");
    
}