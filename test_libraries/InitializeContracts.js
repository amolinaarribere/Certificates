const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const CertisToken = artifacts.require("CertisToken");
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

async function InitializeContracts(chairPerson, PublicOwners, minOwners, user_1){
    let certPoolManager = await CertificatesPoolManager.new({from: chairPerson});
    let certisToken = await CertisToken.new("Certis Token for Test", "CERT", 0, TotalTokenSupply, {from: chairPerson});
    let publicPool = await PublicCertificatesPool.new(PublicOwners, minOwners, certPoolManager.address, {from: user_1});
    let treasury = await Treasury.new(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, publicPool.address, certPoolManager.address, certisToken.address, PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, {from: chairPerson});
    await certPoolManager.Initialize(publicPool.address, treasury.address);

    return [certPoolManager, certisToken];
}

exports.InitializeContracts = InitializeContracts;