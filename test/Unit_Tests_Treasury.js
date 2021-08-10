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
const CertisToken = artifacts.require("CertisToken");
var CertisTokenAbi = CertisToken.abi;
const UintLibrary = artifacts.require("./Libraries/UintLibrary");

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

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Treasury",function(accounts){
    var certisTokenProxy;
    var publicCertPool;
    var Treasury;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const provider_1 = accounts[4]; 
    const provider_2 = accounts[5];
    const user_1 = accounts[6];
    const tokenOwner_1 = accounts[7];
    const tokenOwner_2 = accounts[8];
    const tokenOwner_3 = accounts[9];
    const tokenOwner_4 = accounts[1];
    const tokenOwner_5 = accounts[2];
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
    const Unauthorized = new RegExp("EC22");
    const WrongConfig = new RegExp("EC21");
    const NoPropositionActivated = new RegExp("EC25");
    const PropositionAlreadyInProgress = new RegExp("EC24");
    const CanNotVote = new RegExp("EC23");
    const AlreadyVoted = new RegExp("EC5");
    const MustBeActivated = new RegExp("EC7");
    const MinNumberRequired = new RegExp("EC19");
    const NotAProvider = new RegExp("EC12");
    const NotEmpty = new RegExp("EC11");
    const CertificateAlreadyExists = new RegExp("EC15");
    const NotAllowedToRemoveCertificate = new RegExp("EC14");


    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, contracts[1][0]);   
        Treasury = new web3.eth.Contract(TreasuryAbi, contracts[1][1]);
        certisTokenProxy = new web3.eth.Contract(CertisTokenAbi, contracts[1][2]);
    });

    async function SendingNewProviders(){
        await publicCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: user_1, value: PublicPriceWei, gas: Gas}, function(error, result){});
        await publicCertPool.methods.addProvider(provider_2, provider_2_Info).send({from: user_1, value: PublicPriceWei, gas: Gas}, function(error, result){});
        await pool_common.ValidatingProviders(publicCertPool, PublicOwners, provider_1, provider_2, user_1);
    }

    async function SplitTokenSupply(CT){
        await CT.methods.transfer(tokenOwner_1, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
        await CT.methods.transfer(tokenOwner_2, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
        await CT.methods.transfer(tokenOwner_3, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
        await CT.methods.transfer(tokenOwner_4, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
        await CT.methods.transfer(tokenOwner_5, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    }

    async function checkPrices(_pp, _prp, _cp, _orp){
        const{0:pp,1:prp,2:cp,3:orp} = await Treasury.methods.retrievePrices().call({from: user_1}, function(error, result){});
        expect(parseInt(pp)).to.be.equal(_pp);
        expect(parseInt(prp)).to.be.equal(_prp);
        expect(parseInt(cp)).to.be.equal(_cp);
        expect(parseInt(orp)).to.be.equal(_orp);
    }

    async function checkProp(_plt, _ptp, _mp){
        const{0:plt,1:ptp,2:mp} = await Treasury.methods.retrievePropConfig().call({from: user_1}, function(error, result){});
        expect(parseInt(plt)).to.be.equal(_plt);
        expect(parseInt(ptp)).to.be.equal(_ptp);
        expect(parseInt(mp)).to.be.equal(_mp);
    }

    // ****** TESTING Config ***************************************************************** //

    it("Update Price Configuration WRONG",async function(){
        // act
        try{
            await Treasury.methods.updatePrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei).send({from: user_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        try{
            await Treasury.methods.updatePrices(OwnerRefundPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, PublicPriceWei).send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(WrongConfig);
        }
    });

    it("Update Prop Configuration WRONG",async function(){
        // act
        try{
            await Treasury.methods.updateProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose).send({from: user_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await Treasury.methods.updateProp(PropositionLifeTime, 101, minPercentageToPropose).send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(WrongConfig);
        }
        try{
            await Treasury.methods.updateProp(PropositionLifeTime, PropositionThresholdPercentage, 101).send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(WrongConfig);
        }
    });

    it("Vote/Propose/cancel Configuration WRONG",async function(){
        // act
        await SplitTokenSupply(certisTokenProxy);
        try{
            await Treasury.methods.voteProposition(false).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        // act
        try{
            await Treasury.methods.cancelProposition().send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        // act
        try{
            await Treasury.methods.updatePrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1).send({from: chairPerson, gas: Gas}, function(error, result){});
            await Treasury.methods.voteProposition(false).send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CanNotVote);
        }
        // act
        try{
            await Treasury.methods.cancelProposition().send({from: tokenOwner_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await Treasury.methods.updatePrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1).send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(PropositionAlreadyInProgress);
        }
        // act
        try{
            await Treasury.methods.voteProposition(false).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
            await Treasury.methods.voteProposition(false).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(AlreadyVoted);
        }
        // act
        try{
            await Treasury.methods.voteProposition(false).send({from: tokenOwner_2, gas: Gas}, function(error, result){});
            await Treasury.methods.voteProposition(false).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
            await Treasury.methods.voteProposition(false).send({from: tokenOwner_4, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        
    });

    it("Update Price Configuration CORRECT",async function(){
        // act
        await SplitTokenSupply(certisTokenProxy);

        // Rejected 

        await Treasury.methods.updatePrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1).send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.voteProposition(false).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.voteProposition(false).send({from: tokenOwner_2, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.voteProposition(false).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);

        // Cancelled

        await Treasury.methods.updatePrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1).send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.voteProposition(true).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.voteProposition(true).send({from: tokenOwner_2, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.cancelProposition().send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);

        // Validated

        await Treasury.methods.updatePrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1).send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.voteProposition(true).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.voteProposition(true).send({from: tokenOwner_2, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei);
        await Treasury.methods.voteProposition(true).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1);

        // Validated again

        await Treasury.methods.updatePrices(PublicPriceWei + 2, PrivatePriceWei + 2, ProviderPriceWei + 2, CertificatePriceWei + 2, OwnerRefundPriceWei + 2).send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1);
        await Treasury.methods.voteProposition(false).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1);
        await Treasury.methods.voteProposition(true).send({from: tokenOwner_2, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1);
        await Treasury.methods.voteProposition(false).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1);
        await Treasury.methods.voteProposition(true).send({from: tokenOwner_4, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei + 1, PrivatePriceWei + 1, ProviderPriceWei + 1, CertificatePriceWei + 1, OwnerRefundPriceWei + 1);
        await Treasury.methods.voteProposition(true).send({from: tokenOwner_5, gas: Gas}, function(error, result){});
        await checkPrices(PublicPriceWei + 2, PrivatePriceWei + 2, ProviderPriceWei + 2, CertificatePriceWei + 2, OwnerRefundPriceWei + 2);
    });

    it("Update Prop Configuration CORRECT",async function(){
         // act
         await SplitTokenSupply(certisTokenProxy);

        // Rejected
         await Treasury.methods.updateProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
         await Treasury.methods.voteProposition(false).send({from: tokenOwner_2, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
         await Treasury.methods.voteProposition(false).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
         await Treasury.methods.voteProposition(false).send({from: tokenOwner_4, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
 
         // Cancelled
         await Treasury.methods.updateProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
         await Treasury.methods.cancelProposition().send({from: tokenOwner_3, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
 

         // Validated
         await Treasury.methods.updateProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_2, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
 
        // Validated again
         await Treasury.methods.updateProp(PropositionLifeTime + 2, PropositionThresholdPercentage + 2, minPercentageToPropose + 2).send({from: tokenOwner_4, gas: Gas}, function(error, result){});
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_4, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
         await Treasury.methods.voteProposition(false).send({from: tokenOwner_1, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_2, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
         await Treasury.methods.voteProposition(false).send({from: tokenOwner_3, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
         await Treasury.methods.voteProposition(true).send({from: tokenOwner_5, gas: Gas}, function(error, result){});
         await checkProp(PropositionLifeTime + 2, PropositionThresholdPercentage + 2, minPercentageToPropose + 2);
    });

    // ****** TESTING Paying ***************************************************************** //

     it("Pay New Proposal & New Pool & New Certificate & New Provider WRONG",async function(){
        // act
        try{
            await Treasury.methods.pay(0).send({from: user_1, value: PublicPriceWei - 1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
        // act
        try{
            await Treasury.methods.pay(1).send({from: user_1, value: PrivatePriceWei - 1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
        // act
        try{
            await Treasury.methods.pay(2).send({from: user_1, value: CertificatePriceWei - 1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
        // act
        try{
            await Treasury.methods.pay(3).send({from: user_1, value: ProviderPriceWei - 1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
        // act
        try{
            await Treasury.methods.pay(4).send({from: user_1, value: 1000000000000}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.not.match(NotEnoughFunds);
        }
    });

    it("Pay New Proposal & New Pool & New Certificate & New Provider CORRECT",async function(){
        // act
        var CertisTokenBalance = (new BigNumber(await certisTokenProxy.methods.balanceOf(chairPerson).call({from: chairPerson, gas: Gas}))).dividedBy(2);
        await certisTokenProxy.methods.transfer(user_1, CertisTokenBalance.toNumber()).send({from: chairPerson, gas: Gas}, function(error, result){});
        await Treasury.methods.pay(0).send({from: user_1, value: PublicPriceWei, gas: Gas}, function(error, result){});
        await Treasury.methods.pay(0).send({from: user_1, value: PublicPriceWei + 1, gas: Gas}, function(error, result){});
        await Treasury.methods.pay(1).send({from: user_1, value: PrivatePriceWei, gas: Gas}, function(error, result){});
        await Treasury.methods.pay(1).send({from: user_1, value: PrivatePriceWei + 1, gas: Gas}, function(error, result){});
        await Treasury.methods.pay(2).send({from: user_1, value: CertificatePriceWei, gas: Gas}, function(error, result){});
        await Treasury.methods.pay(2).send({from: user_1, value: CertificatePriceWei + 1, gas: Gas}, function(error, result){});
        await Treasury.methods.pay(3).send({from: user_1, value: ProviderPriceWei, gas: Gas}, function(error, result){});
        await Treasury.methods.pay(3).send({from: user_1, value: ProviderPriceWei + 1, gas: Gas}, function(error, result){});
        // assert
        var balance = parseInt(await web3.eth.getBalance(Treasury._address));
        expect(balance).to.be.equal(PublicPriceWei + (PublicPriceWei + 1) + PrivatePriceWei + (PrivatePriceWei + 1) + ProviderPriceWei + (ProviderPriceWei + 1) + CertificatePriceWei + (CertificatePriceWei + 1));
        var Balance1 = parseInt(await Treasury.methods.retrieveBalance(chairPerson).call({from: user_1}, function(error, result){}));
        var Balance2 = parseInt(await Treasury.methods.retrieveBalance(user_1).call({from: user_1}, function(error, result){}));
        expect(Balance1).to.be.equal(Balance2);
        expect(Balance1).to.be.greaterThan(0);
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
