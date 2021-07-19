const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const CertificatePriceWei = 5;
const OwnerRefundPriceWei = 2;

async function InitializeContracts(chairPerson, PublicOwners, minOwners, user_1, PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei){
    certPoolManager = await CertificatesPoolManager.new({from: chairPerson});
    let publicPool = await PublicCertificatesPool.new(PublicOwners, minOwners, certPoolManager.address, {from: user_1});
    let treasury = await Treasury.new(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, publicPool.address, certPoolManager.address, {from: user_1});
    await certPoolManager.Initialize(publicPool.address, treasury.address);

    return certPoolManager;
}

exports.InitializeContracts = InitializeContracts;
exports.PublicPriceWei = PublicPriceWei;
exports.PrivatePriceWei = PrivatePriceWei;
exports.CertificatePriceWei = CertificatePriceWei;
exports.OwnerRefundPriceWei = OwnerRefundPriceWei;