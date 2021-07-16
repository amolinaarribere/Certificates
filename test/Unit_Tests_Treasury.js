// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const pool_common = require("../test_libraries/Pools.js");
const init = require("../test_libraries/InitializeContracts.js");

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
var PublicCertificatesAbi = PublicCertificates.abi;
const Treasury = artifacts.require("Treasury");
var TreasuryAbi = Treasury.abi;
const UintLibrary = artifacts.require("./Libraries/UintLibrary");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const OwnerRefundPriceWei = 2;
const Gas = 6721975;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Treasury",function(accounts){
    var certPoolManager;
    var publicCertPool;
    var Treasury;
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
    const NotEnoughFunds = new RegExp("EC2");
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
        certPoolManager = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1, PublicPriceWei, PrivatePriceWei, OwnerRefundPriceWei);
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: _treasuryAddress, 1: _publicCertPoolAddress, 2: _chairPerson, 3: _balance} = result;
        Treasury = new web3.eth.Contract(TreasuryAbi, _treasuryAddress);   
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, _publicCertPoolAddress);   
    });

     // ****** TESTING Paying ***************************************************************** //

     it("Pay New Proposal & New Pool WRONG",async function(){
        // act
        try{
            await Treasury.methods.payForNewProposal().send({from: user_1, value: PublicPriceWei - 1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
        // act
        try{
            await Treasury.methods.payForNewPool().send({from: user_1, value: PrivatePriceWei - 1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
    });

    it("Pay New Proposal CORRECT",async function(){
        // act
        await Treasury.methods.payForNewProposal().send({from: user_1, value: PublicPriceWei}, function(error, result){});
        await Treasury.methods.payForNewProposal().send({from: user_1, value: PublicPriceWei + 1}, function(error, result){});
        await Treasury.methods.payForNewPool().send({from: user_1, value: PrivatePriceWei}, function(error, result){});
        await Treasury.methods.payForNewPool().send({from: user_1, value: PrivatePriceWei + 1}, function(error, result){});
        // assert
        var balance = await web3.eth.getBalance(Treasury._address);
        expect(balance).to.be.equal((PublicPriceWei + (PublicPriceWei + 1) + PrivatePriceWei + (PrivatePriceWei + 1)).toString());
    });

    // ****** TESTING Owners Refunding ***************************************************************** //

    it("Owners Refunding WRONG",async function(){
        // act
        try{
            await Treasury.methods.getRefund(user_1, 1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(WrongSender);
        }
    });

    it("Owners Refunding CORRECT",async function(){
        // act
        await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});
        await certPoolManager.sendProposal(provider_2, provider_2_Info, {from: user_1, value: PublicPriceWei});
        await pool_common.ValidateProviderCorrect(publicCertPool, PublicOwners, provider_1, provider_2, user_1);
        // asert
        var BalanceOwners = 0;
        for(var i=0; i < PublicOwners.length; i++){
            BalanceOwners += parseInt(await Treasury.methods.retrieveBalance(PublicOwners[i]).call({from: user_1}, function(error, result){}));
        }
        expect(BalanceOwners).to.be.equal(2 * OwnerRefundPriceWei);
    });


});
