// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const pool_common = require("../test_libraries/Pools.js");
const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PrivateCertificates = artifacts.require("PrivateCertificatesPool");
var PrivateCertificatesAbi = PrivateCertificates.abi;
const Library = artifacts.require("./Libraries/Library");


const PublicPriceWei = constants.PublicPriceWei;
const PrivatePriceWei = constants.PrivatePriceWei;
const CertificatePriceWei = constants.CertificatePriceWei;
const OwnerRefundPriceWei = constants.OwnerRefundPriceWei;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Private Pool",function(accounts){
    var certPoolManager;
    var privateCertPool;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const provider_1 = accounts[4]; 
    const provider_2 = accounts[5];
    const provider_3 = accounts[6]; 
    const user_1 = accounts[7];
    const holder_1 = accounts[8];
    const holder_2 = accounts[9];
    const PrivateOwners = [accounts[0], accounts[5], accounts[9]];
    const extra_owner = accounts[4];

    beforeEach(async function(){
        certPoolManager = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1, PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await certPoolManager.createPrivateCertificatesPool(PrivateOwners, minOwners, {from: user_1, value: PrivatePriceWei});
        let response = await certPoolManager.retrievePrivateCertificatesPool(0, {from: user_1});
        const {0: creator, 1: privateCertPoolAddress} = response;
        privateCertPool = new web3.eth.Contract(PrivateCertificatesAbi, privateCertPoolAddress);  
    });

    // ****** TESTING Adding Owners ***************************************************************** //

    it("Add Owner WRONG",async function(){
        await pool_common.AddOwnerWrong(privateCertPool, PrivateOwners, extra_owner, user_1);
    });

    it("Add Owner CORRECT",async function(){
        await pool_common.AddOwnerCorrect(privateCertPool, PrivateOwners, extra_owner, user_1);
    });

    // ****** TESTING Removing Owner ***************************************************************** //

    it("Removing Owner WRONG",async function(){
        await pool_common.RemoveOwnerWrong(privateCertPool, PrivateOwners, provider_3, user_1);
    });

    it("Removing Owner CORRECT",async function(){
        await pool_common.RemoveOwnerCorrect(privateCertPool, PrivateOwners, user_1);
    });

    // ****** TESTING Adding Provider ***************************************************************** //

    it("Add Provider WRONG",async function(){
        await pool_common.AddProviderWrong(privateCertPool, PrivateOwners, provider_1, user_1, true);
    });

    it("Add Provider CORRECT",async function(){
        await pool_common.AddProviderCorrect(privateCertPool, PrivateOwners, provider_1, provider_2, user_1);
    });

    // ****** TESTING Removing Provider ***************************************************************** //

    it("Removing Provider WRONG",async function(){
        await pool_common.RemoveProviderWrong(privateCertPool, PrivateOwners, provider_1, provider_2, provider_3, user_1, true);
    });

    it("Removing Provider CORRECT",async function(){
        await pool_common.RemoveProviderCorrect(privateCertPool, PrivateOwners, provider_1, provider_2, user_1, true);
    });

    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        await pool_common.AddCertificateWrong(privateCertPool, PrivateOwners, provider_1, provider_2, holder_1, user_1, true);   
    });

    it("Adding Certificate CORRECT",async function(){
        await pool_common.AddCertificateCorrect(privateCertPool, PrivateOwners, provider_1, provider_2, holder_1, holder_2, user_1, true);
    });

    // ****** TESTING Removing Certificate ***************************************************************** //

    it("Removing Certificate WRONG",async function(){
        await pool_common.RemoveCertificateWrong(privateCertPool, PrivateOwners, provider_1, provider_2, holder_1, holder_2, user_1, true);
    });

    it("Removing Certificate CORRECT",async function(){
        await pool_common.RemoveCertificateCorrect(privateCertPool, PrivateOwners, provider_1, provider_2, holder_1, holder_2, user_1, true);
    });
 

});
