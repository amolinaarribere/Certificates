// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const pool_common = require("../test_libraries/Pools.js");
const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
var PublicCertificatesAbi = PublicCertificates.abi;
const CertisToken = artifacts.require("CertisToken");
var CertisTokenAbi = CertisToken.abi;
const Library = artifacts.require("./Libraries/Library");

const FactorUSDtoETH = Math.pow(10, 18 + constants.decimals - 2) / constants.rate;
const PublicPriceWei = constants.PublicPriceUSD * FactorUSDtoETH;
const Gas = constants.Gas;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Public Pool",function(accounts){
    var certPoolManager;
    var publicCertPool;
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
    const extra_owner = accounts[4];
    // providers info
    const provider_1_Info = "Provider 1 Info";
    const provider_2_Info = "Provider 2 Info";
    // owner info
    const extra_owner_Info = "Extra Owner";
    // certificates
    const hash_1 = "0x3fd54831f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
    const hash_2 = "0x3fd54832f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";


    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, contracts[1][0]);  
        await publicCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: user_1, value: PublicPriceWei, gas: Gas}, function(error, result){});
        await publicCertPool.methods.addProvider(provider_2, provider_2_Info).send({from: user_1, value: PublicPriceWei, gas: Gas}, function(error, result){});
    });

    // ****** TESTING Adding Owners ***************************************************************** //

     it("Add Owner WRONG",async function(){
        await pool_common.AddOwnerWrong(publicCertPool, PublicOwners, extra_owner, user_1);
    });

    it("Add Owner CORRECT 1",async function(){
        await pool_common.AddOwnerCorrect(publicCertPool, PublicOwners, extra_owner, user_1);
    });

    it("Add Owner CORRECT 2",async function(){
        await pool_common.AddOwnerCorrect2(publicCertPool, PublicOwners, extra_owner, user_1);
    });

    // ****** TESTING Removing Owner ***************************************************************** //

    it("Removing Owner WRONG",async function(){
        await pool_common.RemoveOwnerWrong(publicCertPool, PublicOwners, provider_3, user_1);
    });

    it("Removing Owner CORRECT 1",async function(){
        await pool_common.RemoveOwnerCorrect(publicCertPool, PublicOwners, user_1);
    });

    it("Removing Owner CORRECT 2",async function(){
        await pool_common.RemoveOwnerCorrect2(publicCertPool, PublicOwners, user_1);
    });

    // ****** TESTING Adding Provider ***************************************************************** //

    it("Add Provider WRONG",async function(){
        await pool_common.AddProviderWrong(publicCertPool, PublicOwners, provider_1, user_1, false)
    });

    // ****** TESTING Validating Provider ***************************************************************** //

    it("Validating Provider WRONG",async function(){
        await pool_common.ValidateProviderWrong(publicCertPool, PublicOwners, provider_1, provider_3, user_1);
    });

    it("Validating Provider CORRECT",async function(){
        await pool_common.ValidateProviderCorrect(publicCertPool, PublicOwners, provider_1, provider_2, user_1);
    });

    // ****** TESTING Removing Provider ***************************************************************** //
    
    it("Removing Provider WRONG",async function(){
        await pool_common.RemoveProviderWrong(publicCertPool, PublicOwners, provider_1, provider_2, provider_3, user_1, false);
    });

    it("Removing Provider CORRECT 1",async function(){
        await pool_common.RemoveProviderCorrect(publicCertPool, PublicOwners, provider_1, provider_2, user_1, false);
    });

    it("Removing Provider CORRECT 2",async function(){
        await pool_common.RemoveProviderCorrect2(publicCertPool, PublicOwners, provider_1, provider_2, user_1, false);
    });

    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        await pool_common.AddCertificateWrong(publicCertPool, PublicOwners, provider_1, provider_2, holder_1, user_1);   
    });

    it("Adding Certificate CORRECT",async function(){
        await pool_common.AddCertificateCorrect(publicCertPool, PublicOwners, provider_1, provider_2, holder_1, holder_2, user_1);
    });

    // ****** TESTING callbacks ***************************************************************** //

    it("on Item Validated WRONG",async function(){
        await pool_common.onItemValidatedWrong(publicCertPool, user_1);
    });

    it("on Item Rejected WRONG",async function(){
        await pool_common.onItemRejectedWrong(publicCertPool, user_1);
    });

    // ****** TESTING Updating Min Owners ***************************************************************** //

    it("Update Min Owner WRONG",async function(){
        await pool_common.UpdateMinOwnersWrong(publicCertPool, PublicOwners, user_1);
    });

    it("Update Min Owner CORRECT 1",async function(){
        await pool_common.UpdateMinOwnersCorrect(publicCertPool, PublicOwners, user_1);
    });

    it("Update Min Owner CORRECT 2",async function(){
        await pool_common.UpdateMinOwnersCorrect2(publicCertPool, PublicOwners, user_1);
    });

});
