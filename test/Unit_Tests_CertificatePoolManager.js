// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const CertisToken = artifacts.require("CertisToken");
var CertisTokenAbi = CertisToken.abi;
const Library = artifacts.require("./Libraries/Library");

const init = require("../test_libraries/InitializeContracts.js");
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

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Certificate Pool Manager",function(accounts){
    var certPoolManager;
    var certisToken;
    var publicPool;
    var treasury;
    var privatePoolGenerator;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const user_1 = accounts[4];
    const tokenOwner_1 = accounts[5];
    const tokenOwner_2 = accounts[6];
    const tokenOwner_3 = accounts[7];
    const tokenOwner_4 = accounts[8];
    const tokenOwner_5 = accounts[9];
    const address_1 = "0x0000000000000000000000000000000000000001";
    const address_2 = "0x0000000000000000000000000000000000000002";
    const address_3 = "0x0000000000000000000000000000000000000003";
    const address_4 = "0x0000000000000000000000000000000000000004";
    const address_5 = "0x0000000000000000000000000000000000000005";
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
    const WrongSender = new RegExp("EC8");
    const NotEnoughBalance = new RegExp("EC20");
    const Unauthorized = new RegExp("EC22");
    const WrongConfig = new RegExp("EC21");
    const NoPropositionActivated = new RegExp("EC25");
    const PropositionAlreadyInProgress = new RegExp("EC24");
    const CanNotVote = new RegExp("EC23");
    const AlreadyVoted = new RegExp("EC5");

    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        certisToken = new web3.eth.Contract(CertisTokenAbi, contracts[1].address);
        publicPool = contracts[2];
        treasury = contracts[3];
        privatePoolGenerator = contracts[4];
    });

    async function SplitTokenSupply(CT){
        await CT.methods.transfer(tokenOwner_1, (TotalTokenSupply / 5)).send({from: chairPerson}, function(error, result){});
        await CT.methods.transfer(tokenOwner_2, (TotalTokenSupply / 5)).send({from: chairPerson}, function(error, result){});
        await CT.methods.transfer(tokenOwner_3, (TotalTokenSupply / 5)).send({from: chairPerson}, function(error, result){});
        await CT.methods.transfer(tokenOwner_4, (TotalTokenSupply / 5)).send({from: chairPerson}, function(error, result){});
        await CT.methods.transfer(tokenOwner_5, (TotalTokenSupply / 5)).send({from: chairPerson}, function(error, result){});
    }

    async function checkAddresses( _ppa, _ta, _ca, _ppga){
        let _publicCertPoolAddressProxy = await certPoolManager.retrievePublicCertificatePoolProxy({from: user_1});
        let _treasuryAddressProxy = await certPoolManager.retrieveTreasuryProxy({from: user_1});
        let _certisAddressProxy = await certPoolManager.retrieveCertisTokenProxy({from: user_1});
        let _privatePoolGeneratorAddressProxy = await certPoolManager.retrievePrivatePoolGeneratorProxy({from: user_1});
        
        expect(_ppa).to.equal(_publicCertPoolAddressProxy);
        expect(_ta).to.equal(_treasuryAddressProxy);
        expect(_ca).to.equal(_certisAddressProxy);
        expect(_ppga).to.equal(_privatePoolGeneratorAddressProxy);
    }

    async function checkProposition( _ppa, _ta, _ca, _ppga){
        var proposition = await certPoolManager.retrieveProposition({from: user_1});
        //let {0: ppa, 1: _treasuryAddress, 2: _certisAddress, 3: _privatePoolGeneratorAddress} = proposition;
        //console.log(proposition);
        //console.log(_ppa);
        //console.log(ppa);
        //console.log(proposition[0]);
        //expect(_ppa).to.equal(proposition[0]);
        //expect(_ta).to.equal(proposition[1]);
    }

    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Configuration",async function(){
        // assert
        await checkAddresses(publicPool.address, treasury.address, certisToken._address, privatePoolGenerator.address);
    });

    it("Retrieve Proposals Details",async function(){
        // act
        await SplitTokenSupply(certisToken);
        //await certPoolManager.updateContracts(address_1, address_2, address_3, address_4, address_5, {from: chairPerson, gas: Gas});
        // assert
        //checkProposition(address_1,"","","");
        
    });

    // ****** UPDATE Contracts ***************************************************************** //
/*
    it("Vote/Propose/Cancel Contracts Configuration WRONG",async function(){
        await SplitTokenSupply(certisToken);
        // act
        try{
            await certPoolManager.updateContracts(address_1, address_2, address_3, address_4, {from: user_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        // act
        try{
            await certPoolManager.cancelProposition({from: chairPerson, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        // act
        try{
            await certPoolManager.updateContracts(address_1, address_2, address_3, address_4, {from: chairPerson, gas: Gas});
            await certPoolManager.voteProposition(false, {from: chairPerson, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CanNotVote);
        }
        // act
        try{
            await certPoolManager.updateContracts(address_1, address_2, address_3, address_4, {from: tokenOwner_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(PropositionAlreadyInProgress);
        }
        // act
        try{
            await certPoolManager.cancelProposition({from: tokenOwner_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
            await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(AlreadyVoted);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner_2, gas: Gas});
            await certPoolManager.voteProposition(false, {from: tokenOwner_3, gas: Gas});
            await certPoolManager.voteProposition(true, {from: tokenOwner_4, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        
    });

    it("Vote/Propose/Cancel Contracts Configuration CORRECT",async function(){
        // act
        let contracts = await init.InitializeManagedBaseContracts(chairPerson, PublicOwners, minOwners, user_1, certPoolManager.address);
        var NewcertisToken = contracts[0];
        var NewpublicPool = contracts[1];
        var Newtreasury = contracts[2];
        var NewprivatePoolGenerator = contracts[3]; 
        let contracts2 = await init.InitializeManagedBaseContracts(chairPerson, PublicOwners, minOwners, user_1, certPoolManager.address);
        var NewcertisToken2 = contracts2[0];
        var NewpublicPool2 = contracts2[1];
        var Newtreasury2 = contracts2[2];
        var NewprivatePoolGenerator2 = contracts2[3]; 

        await SplitTokenSupply(certisToken);
        await SplitTokenSupply(NewcertisToken2);

        // Update contracts Not validated
        await certPoolManager.updateContracts(NewpublicPool.address, Newtreasury.address, NewcertisToken.address, NewprivatePoolGenerator.address, {from: chairPerson, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.voteProposition(false, {from: tokenOwner_2, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.voteProposition(false, {from: tokenOwner_3, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);

        
        // Update contracts cancelled
        await certPoolManager.updateContracts(NewpublicPool.address, Newtreasury.address, NewcertisToken.address, NewprivatePoolGenerator.address, {from: chairPerson, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.voteProposition(true, {from: tokenOwner_1, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.voteProposition(true, {from: tokenOwner_2, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.cancelProposition({from: chairPerson, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);

        // Update contracts validated
        await certPoolManager.updateContracts(NewpublicPool.address, Newtreasury.address, NewcertisToken.address, NewprivatePoolGenerator.address, {from: chairPerson, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.voteProposition(true, {from: tokenOwner_1, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.voteProposition(true, {from: tokenOwner_2, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);
        await certPoolManager.voteProposition(true, {from: tokenOwner_3, gas: Gas});
        await checkAddresses(NewpublicPool.address, Newtreasury.address, NewcertisToken.address, NewprivatePoolGenerator.address);

        // Update contracts to second version with only one token owner 100%
        await certPoolManager.updateContracts(NewpublicPool2.address, Newtreasury2.address, NewcertisToken2.address, NewprivatePoolGenerator2.address, {from: chairPerson, gas: Gas});
        await certPoolManager.voteProposition(true, {from: chairPerson, gas: Gas});
        await checkAddresses(NewpublicPool2.address, Newtreasury2.address, NewcertisToken2.address, NewprivatePoolGenerator2.address);

        // Rollback to original contracts
        await certPoolManager.updateContracts(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address, {from: chairPerson, gas: Gas});
        await checkAddresses(NewpublicPool2.address, Newtreasury2.address, NewcertisToken2.address, NewprivatePoolGenerator2.address);
        await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
        await checkAddresses(NewpublicPool2.address, Newtreasury2.address, NewcertisToken2.address, NewprivatePoolGenerator2.address);
        await certPoolManager.voteProposition(true, {from: tokenOwner_2, gas: Gas});
        await checkAddresses(NewpublicPool2.address, Newtreasury2.address, NewcertisToken2.address, NewprivatePoolGenerator2.address);
        await certPoolManager.voteProposition(false, {from: tokenOwner_3, gas: Gas});
        await checkAddresses(NewpublicPool2.address, Newtreasury2.address, NewcertisToken2.address, NewprivatePoolGenerator2.address);
        await certPoolManager.voteProposition(true, {from: tokenOwner_4, gas: Gas});
        await checkAddresses(NewpublicPool2.address, Newtreasury2.address, NewcertisToken2.address, NewprivatePoolGenerator2.address);
        await certPoolManager.voteProposition(true, {from: tokenOwner_5, gas: Gas});
        await checkAddresses(publicPool.address, treasury.address, certisToken.address, privatePoolGenerator.address);

        
    });

    // ****** UPDATE Contracts ***************************************************************** // 

    it("Vote/Propose/Cancel Prop Configuration WRONG",async function(){
        // act
        await SplitTokenSupply(certisToken);
        try{
            await certPoolManager.updateProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, {from: user_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        // act
        try{
            await certPoolManager.cancelProposition({from: chairPerson, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        // act
        try{
            await certPoolManager.updateProp(PropositionLifeTime, 101, minPercentageToPropose, {from: chairPerson, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(WrongConfig);
        }
        try{
            await certPoolManager.updateProp(PropositionLifeTime, PropositionThresholdPercentage, 101, {from: chairPerson, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(WrongConfig);
        }
        // act
        try{
            await certPoolManager.updateProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, {from: chairPerson, gas: Gas});
            await certPoolManager.voteProposition(false, {from: chairPerson, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CanNotVote);
        }
        // act
        try{
            await certPoolManager.updateProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, {from: tokenOwner_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(PropositionAlreadyInProgress);
        }
        // act
        try{
            await certPoolManager.cancelProposition({from: tokenOwner_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
            await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(AlreadyVoted);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner_2, gas: Gas});
            await certPoolManager.voteProposition(false, {from: tokenOwner_3, gas: Gas});
            await certPoolManager.voteProposition(true, {from: tokenOwner_4, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
    });

    it("Vote/Propose/Cancel Prop Configuration CORRECT",async function(){
      /*  // act
         await SplitTokenSupply();

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
         await Treasury.methods.cancelProposition().send({from: chairPerson, gas: Gas}, function(error, result){});
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
    
*//*
        
    });*/


});
