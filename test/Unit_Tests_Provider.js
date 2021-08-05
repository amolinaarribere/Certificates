// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out
const pool_common = require("../test_libraries/Pools.js");
const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
const Provider = artifacts.require("Provider");
const ProviderAbi = Provider.abi;
var PublicCertificatesAbi = PublicCertificates.abi;
const CertisToken = artifacts.require("CertisToken");
var CertisTokenAbi = CertisToken.abi;
const Library = artifacts.require("./Libraries/Library");

const PublicPriceWei = constants.PublicPriceWei;
const PrivatePriceWei = constants.PrivatePriceWei;
const CertificatePriceWei = constants.CertificatePriceWei;
const OwnerRefundPriceWei = constants.OwnerRefundPriceWei;
const Gas = constants.Gas;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Provider",function(accounts){
    var certPoolManager;
    //var certisToken;
    //var publicCertPool;
    var publicPoolProxy;
    var publicCertPoolAddress;
    const randomPoolAddress = accounts[0];
    var provider;
    var providerContract;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const ProviderOwners = [accounts[4], accounts[5], accounts[6]];
    const user_1 = accounts[7];
    const holder_1 = accounts[8];
    const holder_2 = accounts[9];
    // providers info
    const provider_1_Info = "Provider 1 Info";
    const pool_Info = "Public Pool";
    // certificates
    const hash_1 = "0x3fd54831f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
    // test constants
    const NotAnOwner = new RegExp("EC9");
    const OwnerAlreadyvoted = new RegExp("EC5");
    const MustBeActivated = new RegExp("EC7");
    const NotAllowedToRemoveCertificate = new RegExp("EC14");
    const NotEnoughFunds = new RegExp("EC2");

    beforeEach(async function(){
        // Public Pool creation and provider subscription
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        //certisToken = contracts[1];
        //publicCertPool = contracts[2];
        publicPoolProxy = new web3.eth.Contract(PublicCertificatesAbi, contracts[1][1]);
        provider = await Provider.new(ProviderOwners, minOwners, provider_1_Info, {from: user_1, value: (2 * CertificatePriceWei) + PublicPriceWei});
        //let result = await certPoolManager.retrieveConfiguration({from: user_1});
        //const {0: _publicCertPoolAddress, 1: _treasuryAddress, 2: _certisAddress, 3: _privatePoolGeneratorAddress, 4: _chairPerson, 5: _balance} = result;
        publicCertPoolAddress = publicPoolProxy._address;
        providerContract = new web3.eth.Contract(ProviderAbi, provider.address);
    });

    async function AddProvider(){
        await publicPoolProxy.methods.addProvider(provider.address, provider_1_Info).send({from: user_1, value: PublicPriceWei, gas: Gas}, function(error, result){});
        await ValidateProvider();
    }

    async function ValidateProvider(){
        await publicPoolProxy.methods.validateProvider(provider.address).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
        await publicPoolProxy.methods.validateProvider(provider.address).send({from: PublicOwners[1], gas: Gas}, function(error, result){});
    }

    async function SubscribingToPublicPool(validateOrreject){
        await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: ProviderOwners[0], gas: Gas});
        if(validateOrreject){
            await provider.validatePool(publicCertPoolAddress, {from: ProviderOwners[1], gas: Gas}); 
            await ValidateProvider();
        }
        else{
            await provider.rejectPool(publicCertPoolAddress, {from: ProviderOwners[1], gas: Gas}); 
            await provider.rejectPool(publicCertPoolAddress, {from: ProviderOwners[2], gas: Gas}); 
        }
        
    }

    async function AddingCertificates(validateOrreject){
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[0], gas: Gas});
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[2], gas: Gas});
        if(validateOrreject){
            await provider.validateCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[1], gas: Gas});
            await provider.validateCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[1], gas: Gas});
        }
        else{
            await provider.rejectCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[1], gas: Gas});
            await provider.rejectCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[2], gas: Gas});
            await provider.rejectCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[1], gas: Gas});
            await provider.rejectCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[0], gas: Gas});
        }
        
    }

    async function CheckPool(validateOrreject, subscriptionPriceForPool){
        let {0:_PoolInfo,1:_isPool,2:_AddCertificatePrice,3:_SubscriptionPrice} = await provider.retrievePool(publicCertPoolAddress, {from: user_1});
        let _Pools = await provider.retrieveAllPools({from: user_1});
        let _Total = _Pools.length;
        if(validateOrreject){
            expect(_PoolInfo).to.equal(pool_Info);
            expect(_isPool).to.be.true;
            expect(_AddCertificatePrice.toString()).to.be.equal(CertificatePriceWei.toString());
            expect(_SubscriptionPrice.toString()).to.be.equal(subscriptionPriceForPool.toString());
            expect(_Total).to.equal(1);
            expect(_Pools[0]).to.equal(publicCertPoolAddress);
        }
        else{
            expect(_PoolInfo).to.equal("");
            expect(_isPool).to.be.false;
            expect(_AddCertificatePrice.toString()).to.be.equal("0");
            expect(_SubscriptionPrice.toString()).to.be.equal("0");
            expect(_Total).to.equal(0);
        }
        
    }

    // ****** TESTING Subscribing Pool ***************************************************************** //

    it("Subscribe Pool WRONG 1",async function(){
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: user_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: ProviderOwners[0], gas: Gas});
            await provider.validatePool(publicCertPoolAddress, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Subscribe Pool WRONG 2",async function(){
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei - 1, {from: ProviderOwners[1], gas: Gas});
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: ProviderOwners[2], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
    });

    it("Subscribe Pool CORRECT 1",async function(){
        // act
        let InitBalance = parseInt(await web3.eth.getBalance(provider.address));
        await SubscribingToPublicPool(true);
        let FinalBalance = parseInt(await web3.eth.getBalance(provider.address));
        // assert
        await CheckPool(true, PublicPriceWei);
        expect(InitBalance - PublicPriceWei).to.equal(FinalBalance);
    });

    it("Subscribe Pool CORRECT 2",async function(){
        // act
        let InitBalance = parseInt(await web3.eth.getBalance(provider.address));
        await SubscribingToPublicPool(false);
        let FinalBalance = parseInt(await web3.eth.getBalance(provider.address));
        // assert
        await CheckPool(false, 0);
        expect(InitBalance - FinalBalance).to.equal(0);
    });

    // ****** TESTING Adding Pool ***************************************************************** //

    it("Add Pool WRONG",async function(){
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, 0, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, 0, {from: ProviderOwners[0], gas: Gas});
            await provider.validatePool(publicCertPoolAddress, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Add Pool CORRECT",async function(){
        // act
        AddProvider();
        await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, 0, {from: ProviderOwners[0], gas: Gas});
        await provider.validatePool(publicCertPoolAddress, {from: ProviderOwners[1], gas: Gas});
        // assert
        await CheckPool(true, 0);
    });

    // ****** TESTING Removing Pool ***************************************************************** //

    it("Removing Pool WRONG",async function(){
        // act
        await SubscribingToPublicPool(true);

        try{
            await provider.removePool(publicCertPoolAddress, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.removePool(accounts[0], {from: ProviderOwners[0]});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(MustBeActivated);
        }
        // act
        try{
            await provider.removePool(publicCertPoolAddress, {from: ProviderOwners[0], gas: Gas});
            await provider.validatePool(publicCertPoolAddress, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Removing Pool CORRECT 1",async function(){
        // act
        await SubscribingToPublicPool(true);
        await provider.removePool(publicCertPoolAddress, {from: ProviderOwners[2], gas: Gas});
        await provider.validatePool(publicCertPoolAddress, {from: ProviderOwners[0], gas: Gas});
        // assert
        let _All = await provider.retrieveAllPools({from: user_1});
        let _Total = _All.length;
        expect(_Total).to.equal(0);
    });

    it("Removing Pool CORRECT 2",async function(){
        // act
        await SubscribingToPublicPool(true);
        await provider.removePool(publicCertPoolAddress, {from: ProviderOwners[2], gas: Gas});
        await provider.rejectPool(publicCertPoolAddress, {from: ProviderOwners[0], gas: Gas});
        await provider.rejectPool(publicCertPoolAddress, {from: ProviderOwners[1], gas: Gas});
        // assert
        let _All = await provider.retrieveAllPools({from: user_1});
        let _Total = _All.length;
        expect(_Total).to.equal(1);
    });

    
    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        // act
        await SubscribingToPublicPool(true);

        try{
            await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, {from: user_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[1], gas: Gas});
            await provider.validateCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[1], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Adding Certificate CORRECT 1",async function(){
        // act
        await SubscribingToPublicPool(true);
        await AddingCertificates(true);
    });

    it("Adding Certificate CORRECT 2",async function(){
        // act
        await SubscribingToPublicPool(true);
        await AddingCertificates(false);
    });

    // ****** TESTING callbacks ***************************************************************** //

    it("on Item Validated WRONG",async function(){
        await pool_common.onItemValidatedWrong(providerContract,  user_1);
    });

    it("on Item Rejected WRONG",async function(){
        await pool_common.onItemRejectedWrong(providerContract, user_1);
    });
 

});
