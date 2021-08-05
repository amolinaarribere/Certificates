// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const TreasuryAbi = Treasury.abi;
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const PublicCertificatesPoolAbi = PublicCertificatesPool.abi;
const PrivateCertificatesPool = artifacts.require("PrivateCertificatesPool");
const PrivateCertificatesPoolAbi = PrivateCertificatesPool.abi;
const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const PrivatePoolFactory = artifacts.require("PrivatePoolFactory");
const PrivatePoolFactoryAbi = PrivatePoolFactory.abi;
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
    var certisTokenProxy;
    var publicPoolProxy;
    var treasuryProxy;
    var privatePoolFactoryProxy;
    var certisToken;
    var publicPool;
    var treasury;
    var privatePoolFactory;
    var privatePool;
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
        certisTokenProxy = new web3.eth.Contract(CertisTokenAbi, contracts[1][0]);
        publicPoolProxy = new web3.eth.Contract(PublicCertificatesPoolAbi, contracts[1][1]);
        treasuryProxy = new web3.eth.Contract(TreasuryAbi, contracts[1][2]);
        privatePoolFactoryProxy = new web3.eth.Contract(PrivatePoolFactoryAbi, contracts[1][3]);
        certisToken = contracts[2][0];
        publicPool = contracts[2][1];
        treasury = contracts[2][2];
        privatePoolFactory = contracts[2][3];
        privatePool = contracts[2][4];
    });

    async function SplitTokenSupply(CT){
        await CT.methods.transfer(tokenOwner_1, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
        await CT.methods.transfer(tokenOwner_2, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
        await CT.methods.transfer(tokenOwner_3, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
        await CT.methods.transfer(tokenOwner_4, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
        await CT.methods.transfer(tokenOwner_5, (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    }

    async function checkProxyAddresses( _ppa, _ta, _ca, _ppga){
        let _publicCertPoolAddressProxy = await certPoolManager.retrievePublicCertificatePoolProxy({from: user_1});
        let _treasuryAddressProxy = await certPoolManager.retrieveTreasuryProxy({from: user_1});
        let _certisAddressProxy = await certPoolManager.retrieveCertisTokenProxy({from: user_1});
        let _privatePoolFactoryAddressProxy = await certPoolManager.retrievePrivatePoolFactoryProxy({from: user_1});
        
        expect(_ppa).to.equal(_publicCertPoolAddressProxy);
        expect(_ta).to.equal(_treasuryAddressProxy);
        expect(_ca).to.equal(_certisAddressProxy);
        expect(_ppga).to.equal(_privatePoolFactoryAddressProxy);
    }

    async function checkImplAddresses( _ppa, _ta, _ca, _ppga, _prpa){
        let _publicCertPoolAddress = await certPoolManager.retrievePublicCertificatePool({from: user_1});
        let _treasuryAddress = await certPoolManager.retrieveTreasury({from: user_1});
        let _certisAddress = await certPoolManager.retrieveCertisToken({from: user_1});
        let _privatePoolFactoryAddress = await certPoolManager.retrievePrivatePoolFactory({from: user_1});
        let _privatePool = await certPoolManager.retrievePrivatePool({from: user_1});
        expect(_ppa).to.equal(_publicCertPoolAddress);
        expect(_ta).to.equal(_treasuryAddress);
        expect(_ca).to.equal(_certisAddress);
        expect(_ppga).to.equal(_privatePoolFactoryAddress);
        expect(_prpa).to.equal(_privatePool);
    }

    async function checkProposition( _ppa, _ta, _ca, _ppga, _prpa){
        var proposition = await certPoolManager.retrieveProposition({from: user_1});
        //let {0: ppa, 1: _treasuryAddress, 2: _certisAddress, 3: _privatePoolFactoryAddress, 3: _privatePoolAddress} = proposition;
        //console.log(proposition);
        //console.log(_ppa);
        //console.log(ppa);
        //console.log(proposition[0]);
        //expect(_ppa).to.equal(proposition[0]);
        //expect(_ta).to.equal(proposition[1]);
    }

    async function checkProp(_plt, _ptp, _mp){
        const{0:plt,1:ptp,2:mp} = await certPoolManager.retrievePropConfig({from: user_1});
        expect(parseInt(plt)).to.be.equal(_plt);
        expect(parseInt(ptp)).to.be.equal(_ptp);
        expect(parseInt(mp)).to.be.equal(_mp);
    }

    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Configuration",async function(){
        // assert
        await checkProxyAddresses(publicPoolProxy._address, treasuryProxy._address, certisTokenProxy._address, privatePoolFactoryProxy._address);
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
    });

    it("Retrieve Proposals Details",async function(){
        // act
        await SplitTokenSupply(certisTokenProxy);
        await certPoolManager.updateContracts(address_1, address_2, address_3, address_4, address_5, {from: chairPerson, gas: Gas});
        // assert
        checkProposition(address_1,"","","", "");
        
    });

    // ****** UPDATE Contracts ***************************************************************** //

    it("Vote/Propose/Cancel Contracts Configuration WRONG",async function(){
        await SplitTokenSupply(certisTokenProxy);
        // act
        try{
            await certPoolManager.updateContracts(address_1, address_2, address_3, address_4, address_5, {from: user_1, gas: Gas});
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
            await certPoolManager.updateContracts(address_1, address_2, address_3, address_4, address_5, {from: chairPerson, gas: Gas});
            await certPoolManager.voteProposition(false, {from: chairPerson, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CanNotVote);
        }
        // act
        try{
            await certPoolManager.updateContracts(address_1, address_2, address_3, address_4, address_5, {from: tokenOwner_1, gas: Gas});
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
        var NewprivatePoolFactory = contracts[3]; 
        var NewprivatePool = contracts[4]; 

        await SplitTokenSupply(certisTokenProxy);

        // Update contracts Not validated
        await certPoolManager.updateContracts(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, {from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.voteProposition(false, {from: tokenOwner_2, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.voteProposition(false, {from: tokenOwner_3, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        
        // Update contracts cancelled
        await certPoolManager.updateContracts(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, {from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.voteProposition(true, {from: tokenOwner_1, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.voteProposition(true, {from: tokenOwner_2, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.cancelProposition({from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);

        // Update contracts validated
        await certPoolManager.updateContracts(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, {from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.voteProposition(true, {from: tokenOwner_1, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.voteProposition(true, {from: tokenOwner_2, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        await certPoolManager.voteProposition(true, {from: tokenOwner_3, gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool);

        // Rollback to original contracts
        await certPoolManager.updateContracts(publicPool, treasury, certisToken, privatePoolFactory, privatePool, {from: chairPerson, gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool);
        await certPoolManager.voteProposition(false, {from: tokenOwner_1, gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool);
        await certPoolManager.voteProposition(true, {from: tokenOwner_2, gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool);
        await certPoolManager.voteProposition(false, {from: tokenOwner_3, gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool);
        await certPoolManager.voteProposition(true, {from: tokenOwner_4, gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool);
        await certPoolManager.voteProposition(true, {from: tokenOwner_5, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool);
        
    });

    // ****** UPDATE Contracts ***************************************************************** // 

    it("Vote/Propose/Cancel Prop Configuration WRONG",async function(){
        // act
        await SplitTokenSupply(certisTokenProxy);
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
        // act
        await SplitTokenSupply(certisTokenProxy);

        // Rejected
        await certPoolManager.updateProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1, {from: tokenOwner_1, gas: Gas});
        await certPoolManager.voteProposition(true,{from: tokenOwner_1, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
        await certPoolManager.voteProposition(false,{from: tokenOwner_2, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
        await certPoolManager.voteProposition(false,{from: tokenOwner_3, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
        await certPoolManager.voteProposition(false,{from: tokenOwner_4, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
 
        // Cancelled
        await certPoolManager.updateProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1, {from: tokenOwner_3, gas: Gas});
        await certPoolManager.voteProposition(true,{from: tokenOwner_3, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
        await certPoolManager.voteProposition(true,{from: tokenOwner_1, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
        await certPoolManager.cancelProposition({from: tokenOwner_3, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);

        // Validated
        await certPoolManager.updateProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1, {from: tokenOwner_3, gas: Gas});
        await certPoolManager.voteProposition(true,{from: tokenOwner_3, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
        await certPoolManager.voteProposition(true,{from: tokenOwner_1, gas: Gas});
        await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose);
        await certPoolManager.voteProposition(true,{from: tokenOwner_2, gas: Gas});
        await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
 
        // Validated again
        await certPoolManager.updateProp(PropositionLifeTime + 2, PropositionThresholdPercentage + 2, minPercentageToPropose + 2, {from: tokenOwner_4, gas: Gas});
        await certPoolManager.voteProposition(true,{from: tokenOwner_4, gas: Gas});
        await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
        await certPoolManager.voteProposition(false,{from: tokenOwner_1, gas: Gas});
        await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
        await certPoolManager.voteProposition(true,{from: tokenOwner_2, gas: Gas});
        await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
        await certPoolManager.voteProposition(false,{from: tokenOwner_3, gas: Gas});
        await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1);
        await certPoolManager.voteProposition(true,{from: tokenOwner_5, gas: Gas});
        await checkProp(PropositionLifeTime + 2, PropositionThresholdPercentage + 2, minPercentageToPropose + 2);
        
    });


});
