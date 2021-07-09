// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const pool_common = require("../test_libraries/Pools.js");

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
var PublicCertificatesAbi = PublicCertificates.abi;
const Library = artifacts.require("./Libraries/Library");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const Gas = 6721975;

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
    // test constants
    const WrongSender = new RegExp("EC8");
    const NotAnOwner = new RegExp("EC9");
    const OwnerAlreadyvoted = new RegExp("EC5");
    const NotSubmittedByCreator = new RegExp("EC4");
    const NotAllowedRemoveEntity = new RegExp("EC10");
    const MustBeActivated = new RegExp("EC7");
    const MinNumberRequired = new RegExp("EC19");
    const NotAProvider = new RegExp("EC12");
    const NotEmpty = new RegExp("EC11");
    const CertificateAlreadyExists = new RegExp("EC15");
    const NotAllowedToRemoveCertificate = new RegExp("EC14");

    beforeEach(async function(){
        certPoolManager = await CertificatesPoolManager.new(PublicOwners, minOwners, PublicPriceWei, PrivatePriceWei, {from: chairPerson});
        await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});
        await certPoolManager.sendProposal(provider_2, provider_2_Info, {from: user_1, value: PublicPriceWei});
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: publicCertPoolAddress, 1: _chairPerson, 2: _balance} = result;
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, publicCertPoolAddress);      
    });

     // ****** TESTING Adding Owners ***************************************************************** //

     it("Add Owner WRONG",async function(){
        await pool_common.AddOwnerWrong(publicCertPool, PublicOwners, extra_owner, user_1);
    });

    it("Add Owner CORRECT",async function(){
        await pool_common.AddOwnerCorrect(publicCertPool, PublicOwners, extra_owner, user_1);
    });

    // ****** TESTING Removing Owner ***************************************************************** //

    it("Removing Owner WRONG",async function(){
        await pool_common.RemoveOwnerWrong(publicCertPool, PublicOwners, provider_3, user_1);
    });

    it("Removing Owner CORRECT",async function(){
        await pool_common.RemoveOwnerCorrect(publicCertPool, PublicOwners, user_1);
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

    it("Removing Provider CORRECT",async function(){
        await pool_common.RemoveProviderCorrect(publicCertPool, PublicOwners, provider_1, provider_2, user_1, false);
    });

    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        await pool_common.AddCertificateWrong(publicCertPool, PublicOwners, provider_1, provider_2, holder_1, user_1);   
    });

    it("Adding Certificate CORRECT",async function(){
        await pool_common.AddCertificateCorrect(publicCertPool, PublicOwners, provider_1, provider_2, holder_1, holder_2, user_1);
    });

    // ****** TESTING Removing Certificate ***************************************************************** //

    it("Removing Certificate WRONG",async function(){
        await pool_common.RemoveCertificateWrong(publicCertPool, PublicOwners, provider_1, provider_2, holder_1, holder_2, user_1);
    });

    it("Removing Certificate CORRECT",async function(){
        await pool_common.RemoveCertificateCorrect(publicCertPool, PublicOwners, provider_1, provider_2, holder_1, holder_2, user_1);
    });

});
