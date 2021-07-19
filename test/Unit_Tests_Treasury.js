// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out
const BigNumber = require('bignumber.js');

const pool_common = require("../test_libraries/Pools.js");
const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
var PublicCertificatesAbi = PublicCertificates.abi;
const Treasury = artifacts.require("Treasury");
var TreasuryAbi = Treasury.abi;
const UintLibrary = artifacts.require("./Libraries/UintLibrary");

const PublicPriceWei = constants.PublicPriceWei;
const PrivatePriceWei = constants.PrivatePriceWei;
const CertificatePriceWei = constants.CertificatePriceWei;
const OwnerRefundPriceWei = constants.OwnerRefundPriceWei;

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
    const NotEnoughBalance = new RegExp("EC20");
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
        certPoolManager = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1, PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: _treasuryAddress, 1: _publicCertPoolAddress, 2: _chairPerson, 3: _balance} = result;
        Treasury = new web3.eth.Contract(TreasuryAbi, _treasuryAddress);   
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, _publicCertPoolAddress);   
    });

    async function SendingNewProviders(){
        await publicCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: user_1, value: PublicPriceWei});
        await publicCertPool.methods.addProvider(provider_2, provider_2_Info).send({from: user_1, value: PublicPriceWei});
        await pool_common.ValidateProviderCorrect(publicCertPool, PublicOwners, provider_1, provider_2, user_1);
    }

     // ****** TESTING Paying ***************************************************************** //

     it("Pay New Proposal & New Pool & New Certificate WRONG",async function(){
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
        // act
        try{
            await Treasury.methods.payForNewCertificate().send({from: user_1, value: CertificatePriceWei - 1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
    });

    it("Pay New Proposal & New Pool & New Certificate CORRECT",async function(){
        // act
        await Treasury.methods.payForNewProposal().send({from: user_1, value: PublicPriceWei}, function(error, result){});
        await Treasury.methods.payForNewProposal().send({from: user_1, value: PublicPriceWei + 1}, function(error, result){});
        await Treasury.methods.payForNewPool().send({from: user_1, value: PrivatePriceWei}, function(error, result){});
        await Treasury.methods.payForNewPool().send({from: user_1, value: PrivatePriceWei + 1}, function(error, result){});
        await Treasury.methods.payForNewCertificate().send({from: user_1, value: CertificatePriceWei}, function(error, result){});
        await Treasury.methods.payForNewCertificate().send({from: user_1, value: CertificatePriceWei + 1}, function(error, result){});
        // assert
        var balance = await web3.eth.getBalance(Treasury._address);
        expect(balance).to.be.equal((PublicPriceWei + (PublicPriceWei + 1) + PrivatePriceWei + (PrivatePriceWei + 1) + CertificatePriceWei + (CertificatePriceWei + 1)).toString());
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
        await SendingNewProviders();
        // asert
        var BalanceOwners = 0;
        for(var i=0; i < PublicOwners.length; i++){
            BalanceOwners += parseInt(await Treasury.methods.retrieveBalance(PublicOwners[i]).call({from: user_1}, function(error, result){}));
        }
        expect(BalanceOwners).to.be.equal(2 * OwnerRefundPriceWei);
    });

    // ****** TESTING Owners Refunding ***************************************************************** //

    it("Withdraw WRONG",async function(){
        // act
        try{
            await Treasury.methods.withdraw(1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughBalance);
        }
    });

    it("Withdraw CORRECT",async function(){
        // act
        await SendingNewProviders();
        // assert
        let TreasuryBalance = parseInt(await web3.eth.getBalance(Treasury._address));
        for(let i=0; i < PublicOwners.length; i++){
            let balance = new BigNumber(await Treasury.methods.retrieveBalance(PublicOwners[i]).call({from: user_1}, function(error, result){}));
            TreasuryBalance -= balance.toNumber();
            let initialBalance = new BigNumber(await web3.eth.getBalance(PublicOwners[i]));
            let request = await Treasury.methods.withdraw(balance).send({from: PublicOwners[i], gasPrice: 1}, function(error, result){});
            // assert that money has been transfered
            let finalBalance = new BigNumber(await web3.eth.getBalance(PublicOwners[i]));
            expect(finalBalance.minus(initialBalance.minus(request.gasUsed).plus(balance)).toString()).to.be.equal("0");
            // assert that account balance has been updated
            balance = new BigNumber(await Treasury.methods.retrieveBalance(PublicOwners[i]).call({from: user_1}, function(error, result){}));
            expect(balance.toString()).to.be.equal("0");
        }
        let FinalTreasuryBalance = parseInt(await web3.eth.getBalance(Treasury._address));
        expect(FinalTreasuryBalance).to.be.equal(TreasuryBalance);
    });

});