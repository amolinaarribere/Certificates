const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const TreasuryAbi = Treasury.abi;
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const PublicCertificatesPoolAbi = PublicCertificatesPool.abi;
const PrivateCertificatesPool = artifacts.require("PrivateCertificatesPool");
const Provider = artifacts.require("Provider");
const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const PrivatePoolFactory = artifacts.require("PrivatePoolFactory");
const PrivatePoolFactoryAbi = PrivatePoolFactory.abi;
const ProviderFactory = artifacts.require("ProviderFactory");
const ProviderFactoryAbi = ProviderFactory.abi;

const constants = require("../test_libraries/constants.js");
const obj = require("../test_libraries/objects.js");

const PublicPriceWei = constants.PublicPriceWei;
const PrivatePriceWei = constants.PrivatePriceWei;
const ProviderPriceWei = constants.ProviderPriceWei;
const CertificatePriceWei = constants.CertificatePriceWei;
const OwnerRefundPriceWei = constants.OwnerRefundPriceWei;
const PropositionLifeTime = constants.PropositionLifeTime;
const PropositionThresholdPercentage = constants.PropositionThresholdPercentage;
const minPercentageToPropose = constants.minPercentageToPropose;
const TotalTokenSupply = constants.TotalTokenSupply;
const Gas = constants.Gas;

const CertisTokenProxyInitializerMethod = {
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
const TreasuryProxyInitializerMethod = {
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
        "name": "ProviderPriceWei",
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
const PrivatePoolFactoryProxyInitializerMethod = {
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
const ProviderFactoryProxyInitializerMethod = {
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
const PublicCertificatesPoolProxyInitializerMethod = {
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

async function InitializeContracts(chairPerson, PublicOwners, minOwners, user_1){
  let certPoolManager = await CertificatesPoolManager.new(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, {from: chairPerson});
  let implementations = await deployImplementations(user_1);
  let ProxyData = returnProxyInitData(PublicOwners, minOwners, certPoolManager.address, chairPerson);

  await certPoolManager.InitializeContracts(obj.returnUpgradeObject(implementations[0], implementations[1], implementations[2], implementations[3], implementations[4], implementations[5], implementations[6],
    ProxyData[0], ProxyData[1], ProxyData[2], ProxyData[3], ProxyData[4]), {from: chairPerson});

  let proxies = await retrieveProxies(certPoolManager, user_1);

  return [certPoolManager, proxies, implementations];
}

async function deployImplementations(user_1){
    let publicPool = await PublicCertificatesPool.new({from: user_1});
    let treasury = await Treasury.new({from: user_1});
    let certisToken = await CertisToken.new({from: user_1});
    let privatePoolFactory = await PrivatePoolFactory.new({from: user_1});
    let privatePool = await PrivateCertificatesPool.new({from: user_1});
    let providerFactory = await ProviderFactory.new({from: user_1});
    let provider = await Provider.new({from: user_1});

    return [publicPool.address, treasury.address, certisToken.address, privatePoolFactory.address, privatePool.address, providerFactory.address, provider.address];
}

async function retrieveProxies(certPoolManager, user_1){
  let publicPoolProxy = await certPoolManager.retrievePublicCertificatePoolProxy({from: user_1});
  let treasuryProxy = await certPoolManager.retrieveTreasuryProxy({from: user_1});
  let certisTokenProxy = await certPoolManager.retrieveCertisTokenProxy({from: user_1});
  let privatePoolFactoryProxy = await certPoolManager.retrievePrivatePoolFactoryProxy({from: user_1});
  let providerFactoryProxy = await certPoolManager.retrieveProviderFactoryProxy({from: user_1});

  return [publicPoolProxy, treasuryProxy, certisTokenProxy, privatePoolFactoryProxy, providerFactoryProxy];
}

function getProxyData(method, parameters){
  return web3.eth.abi.encodeFunctionCall(method, parameters);
}

function returnProxyInitData(PublicOwners, minOwners, certPoolManager, chairPerson){
  let CertisProxyData = getProxyData(CertisTokenProxyInitializerMethod, ["Certis Token for Test", "CERT", TotalTokenSupply, certPoolManager, 0, chairPerson]);
  let PublicCertificatesPoolProxyData = getProxyData(PublicCertificatesPoolProxyInitializerMethod, [PublicOwners, minOwners, certPoolManager]);
  let TreasuryProxyData = getProxyData(TreasuryProxyInitializerMethod, [PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei, certPoolManager,  PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose]);
  let PrivatePoolFactoryProxyData = getProxyData(PrivatePoolFactoryProxyInitializerMethod, [certPoolManager]);
  let ProviderFactoryProxyData = getProxyData(ProviderFactoryProxyInitializerMethod, [certPoolManager]);

  return [PublicCertificatesPoolProxyData, TreasuryProxyData, CertisProxyData, PrivatePoolFactoryProxyData, ProviderFactoryProxyData];
}

exports.InitializeContracts = InitializeContracts;
exports.deployImplementations = deployImplementations;
exports.returnProxyInitData = returnProxyInitData;