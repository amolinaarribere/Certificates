const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const CertisToken = artifacts.require("CertisToken");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const CertificatePriceWei = 5;
const OwnerRefundPriceWei = 2;
const TotalTokenSupply = 1000;
const PropositionLifeTime = 604800;
const PropositionThresholdPercentage = 50;
const minPercentageToPropose = 5;

async function InitializeContracts(chairPerson, PublicOwners, minOwners, user_1, PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei){
    let certPoolManager = await CertificatesPoolManager.new({from: chairPerson});
    let certisToken = await CertisToken.new("Certis Token for Test", "CERT", 0, TotalTokenSupply, {from: chairPerson});
    let publicPool = await PublicCertificatesPool.new(PublicOwners, minOwners, certPoolManager.address, {from: user_1});
    let treasury = await Treasury.new(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, publicPool.address, certPoolManager.address, certisToken.address, PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, {from: user_1});
    await certPoolManager.Initialize(publicPool.address, treasury.address);

    return [certPoolManager, certisToken];
}

exports.InitializeContracts = InitializeContracts;
exports.PublicPriceWei = PublicPriceWei;
exports.PrivatePriceWei = PrivatePriceWei;
exports.CertificatePriceWei = CertificatePriceWei;
exports.OwnerRefundPriceWei = OwnerRefundPriceWei;
exports.PropositionLifeTime = PropositionLifeTime;
exports.PropositionThresholdPercentage = PropositionThresholdPercentage;
exports.minPercentageToPropose = minPercentageToPropose;