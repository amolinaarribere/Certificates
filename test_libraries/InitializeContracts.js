const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const TreasuryAbi = Treasury.abi;
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const PublicCertificatesPoolAbi = PublicCertificatesPool.abi;
const PrivateCertificatesPool = artifacts.require("PrivateCertificatesPool");
const PrivateCertificatesPoolAbi = PrivateCertificatesPool.abi;
const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const PrivatePoolGenerator = artifacts.require("PrivatePoolGenerator");
const PrivatePoolGeneratorAbi = PrivatePoolGenerator.abi;

const TreasuryProxy = artifacts.require("TreasuryProxy");
const PublicCertificatesPoolProxy = artifacts.require("PublicCertificatesPoolProxy");
const PrivateCertificatesPoolProxy = artifacts.require("PrivateCertificatesPoolProxy");
const CertisTokenProxy = artifacts.require("CertisTokenProxy");
const PrivatePoolGeneratorProxy = artifacts.require("PrivatePoolGeneratorProxy");

const constants = require("../test_libraries/constants.js");

const PublicPriceWei = constants.PublicPriceWei;
const PrivatePriceWei = constants.PrivatePriceWei;
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
var PrivatePoolGeneratorProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      }
    ],
    "name": "PrivatePoolGenerator_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
};
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

async function InitializeContracts(chairPerson, PublicOwners, minOwners, user_1){
  let certPoolManager = await CertificatesPoolManager.new(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, {from: chairPerson});
  let implementations = await deployImplementations(user_1);
  let proxies = await deployProxies(chairPerson, PublicOwners, minOwners, user_1, implementations[0], implementations[1], implementations[2], implementations[3], certPoolManager.address)

  await certPoolManager.InitializeContracts(proxies[1], proxies[2], proxies[0], proxies[3], implementations[4], {from: chairPerson});

  return [certPoolManager, proxies, implementations];
}

async function deployImplementations(user_1){
    let certisToken = await CertisToken.new({from: user_1});
    let publicPool = await PublicCertificatesPool.new({from: user_1});
    let treasury = await Treasury.new({from: user_1});
    let privatePoolGenerator = await PrivatePoolGenerator.new({from: user_1});
    let privatePool = await PrivateCertificatesPool.new({from: user_1});

    return [certisToken.address, publicPool.address, treasury.address, privatePoolGenerator.address, privatePool.address];
}

async function deployProxies(chairPerson, PublicOwners, minOwners, user_1, certisToken, publicPool, treasury, privatePoolGenerator, certPoolManager){
  let CertisTokenProxyInitializerParameters = ["Certis Token for Test", "CERT", 0, TotalTokenSupply];
  let CertisProxyData = web3.eth.abi.encodeFunctionCall(CertisTokenProxyInitializerMethod, CertisTokenProxyInitializerParameters);
  let certisTokenProxy = await CertisTokenProxy.new(certisToken, certPoolManager, CertisProxyData, {from: chairPerson});

  let PublicCertificatesPoolProxyInitializerParameters = [PublicOwners, minOwners, certPoolManager];
  let PublicCertificatesPoolProxyData = web3.eth.abi.encodeFunctionCall(PublicCertificatesPoolProxyInitializerMethod, PublicCertificatesPoolProxyInitializerParameters);
  let publicPoolProxy = await PublicCertificatesPoolProxy.new(publicPool, certPoolManager, PublicCertificatesPoolProxyData, {from: user_1});

  let TreasuryProxyInitializerParameters = [PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, certPoolManager,  PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose];
  let TreasuryProxyData = web3.eth.abi.encodeFunctionCall(TreasuryProxyInitializerMethod, TreasuryProxyInitializerParameters);
  let treasuryProxy = await TreasuryProxy.new(treasury, certPoolManager, TreasuryProxyData, {from: chairPerson});

  let PrivatePoolGeneratorProxyInitializerParameters = [certPoolManager];
  let PrivatePoolGeneratorProxyData = web3.eth.abi.encodeFunctionCall(PrivatePoolGeneratorProxyInitializerMethod, PrivatePoolGeneratorProxyInitializerParameters);  
  let privatePoolGeneratorProxy = await PrivatePoolGeneratorProxy.new(privatePoolGenerator, certPoolManager, PrivatePoolGeneratorProxyData, {from: user_1});

  return [certisTokenProxy.address, publicPoolProxy.address, treasuryProxy.address, privatePoolGeneratorProxy.address];
}

async function InitializeManagedBaseContracts(chairPerson, PublicOwners, minOwners, user_1, certPoolManagerAddress){
  let implementations = await deployImplementations(user_1);

  let certisToken = new web3.eth.Contract(CertisTokenAbi, implementations[0]);
  await certisToken.methods.CertisToken_init("Certis Token for Test", "CERT", 0, TotalTokenSupply).send({from: chairPerson, gas: Gas});

  let publicPool = new web3.eth.Contract(PublicCertificatesPoolAbi, implementations[1]);
  await publicPool.methods.PublicCertPool_init(PublicOwners, minOwners, certPoolManagerAddress).send({from: user_1, gas: Gas});

  let treasury = new web3.eth.Contract(TreasuryAbi, implementations[2]);
  await treasury.methods.Treasury_init(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, certPoolManagerAddress, PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose).send({from: chairPerson, gas: Gas});

  let privatePoolGenerator = new web3.eth.Contract(PrivatePoolGeneratorAbi, implementations[3]);
  await privatePoolGenerator.methods.PrivatePoolGenerator_init(certPoolManagerAddress).send({from: user_1, gas: Gas});

  return implementations;
}

exports.InitializeContracts = InitializeContracts;
exports.InitializeManagedBaseContracts = InitializeManagedBaseContracts;