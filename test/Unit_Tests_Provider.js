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
const ProviderFactory = artifacts.require("ProviderFactory");
const ProviderFactoryAbi = ProviderFactory.abi;

const PublicPriceWei = constants.PublicPriceWei;
const ProviderPriceWei = constants.ProviderPriceWei;
const CertificatePriceWei = constants.CertificatePriceWei;
const Gas = constants.Gas;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Provider",function(accounts){
    var certPoolManager;
    //var certisToken;
    //var publicCertPool;
    var publicPoolProxy;
    var publicCertPoolAddress;
    var providerFactoryProxy;
    const randomPoolAddress = accounts[0];
    var provider;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const ProviderOwners = [accounts[4], accounts[5], accounts[6]];
    const user_1 = accounts[7];
    const holder_1 = accounts[8];
    const holder_2 = accounts[9];
    const extra_owner = accounts[1];
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
        publicPoolProxy = new web3.eth.Contract(PublicCertificatesAbi, contracts[1][0]);
        publicCertPoolAddress = publicPoolProxy._address;
        providerFactoryProxy = new web3.eth.Contract(ProviderFactoryAbi, contracts[1][4]);
        await providerFactoryProxy.methods.create(ProviderOwners, minOwners, provider_1_Info).send({from: user_1, value: ProviderPriceWei, gas: Gas}, function(error, result){});
        let response = await providerFactoryProxy.methods.retrieve(0).call({from: user_1}, function(error, result){});
        const {0: creator, 1: providerAddress} = response;
        provider = new web3.eth.Contract(ProviderAbi, providerAddress); 
        await web3.eth.sendTransaction({from: user_1, to: provider._address, value:(2 * CertificatePriceWei) + PublicPriceWei});
    });

    async function AddProvider(){
        await publicPoolProxy.methods.addProvider(provider._address, provider_1_Info).send({from: user_1, value: PublicPriceWei, gas: Gas}, function(error, result){});
        await ValidateProvider();
    }

    async function ValidateProvider(){
        await publicPoolProxy.methods.validateProvider(provider._address).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
        await publicPoolProxy.methods.validateProvider(provider._address).send({from: PublicOwners[1], gas: Gas}, function(error, result){});
    }

    async function SubscribingToPublicPool(validateOrreject){
        await provider.methods.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
        if(validateOrreject){
            await provider.methods.validatePool(publicCertPoolAddress).send({from: ProviderOwners[1], gas: Gas}, function(error, result){}); 
            await ValidateProvider();
        }
        else{
            await provider.methods.rejectPool(publicCertPoolAddress).send({from: ProviderOwners[1], gas: Gas}, function(error, result){}); 
            await provider.methods.rejectPool(publicCertPoolAddress).send({from: ProviderOwners[2], gas: Gas}, function(error, result){}); 
        }
        
    }

    async function AddingCertificates(validateOrreject){
        await provider.methods.addCertificate(publicCertPoolAddress, hash_1, holder_1).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
        await provider.methods.addCertificate(publicCertPoolAddress, hash_1, holder_2).send({from: ProviderOwners[2], gas: Gas}, function(error, result){});
        if(validateOrreject){
            await provider.methods.validateCertificate(publicCertPoolAddress, hash_1, holder_1).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
            await provider.methods.validateCertificate(publicCertPoolAddress, hash_1, holder_2).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
        }
        else{
            await provider.methods.rejectCertificate(publicCertPoolAddress, hash_1, holder_1).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
            await provider.methods.rejectCertificate(publicCertPoolAddress, hash_1, holder_1).send({from: ProviderOwners[2], gas: Gas}, function(error, result){});
            await provider.methods.rejectCertificate(publicCertPoolAddress, hash_1, holder_2).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
            await provider.methods.rejectCertificate(publicCertPoolAddress, hash_1, holder_2).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
        }
        var isCert = await provider.methods.isCertificate(publicCertPoolAddress, hash_1, holder_2).call({from: user_1, gas: Gas}, function(error, result){});
        expect(isCert).to.equal(validateOrreject);
        
    }

    async function CheckPool(validateOrreject, subscriptionPriceForPool){
        let {0:_PoolInfo,1:_isPool,2:_AddCertificatePrice,3:_SubscriptionPrice} = await provider.methods.retrievePool(publicCertPoolAddress).call({from: user_1}, function(error, result){});
        let _Pools = await provider.methods.retrieveAllPools().call({from: user_1}, function(error, result){});
        let _Total = _Pools.length;
        if(validateOrreject){
            expect(_PoolInfo).to.equal(pool_Info);
            expect(_isPool).to.be.true;
            expect(_AddCertificatePrice.toString()).to.be.equal(CertificatePriceWei.toString());
            expect(_SubscriptionPrice.toString()).to.be.equal(subscriptionPriceForPool.toString());
            expect(_Total).to.equal(1);
            expect(_Pools[0]).to.equal(pool_common.AddressToBytes32(publicCertPoolAddress));
        }
        else{
            expect(_PoolInfo).to.equal("");
            expect(_isPool).to.be.false;
            expect(_AddCertificatePrice.toString()).to.be.equal("0");
            expect(_SubscriptionPrice.toString()).to.be.equal("0");
            expect(_Total).to.equal(0);
        }
        
    }

    // ****** TESTING Adding Owners ***************************************************************** //

    it("Add Owner WRONG",async function(){
        await pool_common.AddOwnerWrong(provider, ProviderOwners, extra_owner, user_1);
    });

    it("Add Owner CORRECT 1",async function(){
        await pool_common.AddOwnerCorrect(provider, ProviderOwners, extra_owner, user_1);
    });

    it("Add Owner CORRECT 2",async function(){
        await pool_common.AddOwnerCorrect2(provider, ProviderOwners, extra_owner, user_1);
    });

    // ****** TESTING Subscribing Pool ***************************************************************** //

    it("Subscribe Pool WRONG 1",async function(){
        // act
        try{
            await provider.methods.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei).send({from: user_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.methods.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
            await provider.methods.validatePool(publicCertPoolAddress).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
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
            await provider.methods.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei - 1).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
            await provider.methods.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei).send({from: ProviderOwners[2], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
    });

    it("Subscribe Pool CORRECT 1",async function(){
        // act
        let InitBalance = parseInt(await web3.eth.getBalance(provider._address));
        await SubscribingToPublicPool(true);
        let FinalBalance = parseInt(await web3.eth.getBalance(provider._address));
        // assert
        await CheckPool(true, PublicPriceWei);
        expect(InitBalance - PublicPriceWei).to.equal(FinalBalance);
    });

    it("Subscribe Pool CORRECT 2",async function(){
        // act
        let InitBalance = parseInt(await web3.eth.getBalance(provider._address));
        await SubscribingToPublicPool(false);
        let FinalBalance = parseInt(await web3.eth.getBalance(provider._address));
        // assert
        await CheckPool(false, 0);
        expect(InitBalance - FinalBalance).to.equal(0);
    });

    // ****** TESTING Adding Pool ***************************************************************** //

    it("Add Pool WRONG",async function(){
        // act
        try{
            await provider.methods.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, 0).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.methods.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, 0).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
            await provider.methods.validatePool(publicCertPoolAddress).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
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
        await provider.methods.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, 0).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
        await provider.methods.validatePool(publicCertPoolAddress).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
        // assert
        await CheckPool(true, 0);
    });

    // ****** TESTING Removing Pool ***************************************************************** //

    it("Removing Pool WRONG",async function(){
        // act
        await SubscribingToPublicPool(true);

        try{
            await provider.methods.removePool(publicCertPoolAddress).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.methods.removePool(accounts[0]).send({from: ProviderOwners[0]}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(MustBeActivated);
        }
        // act
        try{
            await provider.methods.removePool(publicCertPoolAddress).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
            await provider.methods.validatePool(publicCertPoolAddress).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
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
        await provider.methods.removePool(publicCertPoolAddress).send({from: ProviderOwners[2], gas: Gas}, function(error, result){});
        await provider.methods.validatePool(publicCertPoolAddress).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
        // assert
        let _All = await provider.methods.retrieveAllPools().call({from: user_1}, function(error, result){});
        let _Total = _All.length;
        expect(_Total).to.equal(0);
    });

    it("Removing Pool CORRECT 2",async function(){
        // act
        await SubscribingToPublicPool(true);
        await provider.methods.removePool(publicCertPoolAddress).send({from: ProviderOwners[2], gas: Gas}, function(error, result){});
        await provider.methods.rejectPool(publicCertPoolAddress).send({from: ProviderOwners[0], gas: Gas}, function(error, result){});
        await provider.methods.rejectPool(publicCertPoolAddress).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
        // assert
        let _All = await provider.methods.retrieveAllPools().call({from: user_1}, function(error, result){});
        let _Total = _All.length;
        expect(_Total).to.equal(1);
    });

    
    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        // act
        await SubscribingToPublicPool(true);

        try{
            await provider.methods.addCertificate(publicCertPoolAddress, hash_1, holder_2).send({from: user_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.methods.addCertificate(publicCertPoolAddress, hash_1, holder_2).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
            await provider.methods.validateCertificate(publicCertPoolAddress, hash_1, holder_2).send({from: ProviderOwners[1], gas: Gas}, function(error, result){});
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
        await pool_common.onItemValidatedWrong(provider,  user_1);
    });

    it("on Item Rejected WRONG",async function(){
        await pool_common.onItemRejectedWrong(provider, user_1);
    });

    // ****** TESTING Updating Min Owners ***************************************************************** //

    it("Update Min Owner WRONG",async function(){
        await pool_common.UpdateMinOwnersWrong(provider, ProviderOwners, user_1);
    });

    it("Update Min Owner CORRECT 1",async function(){
        await pool_common.UpdateMinOwnersCorrect(provider, ProviderOwners, user_1);
    });

    it("Update Min Owner CORRECT 2",async function(){
        await pool_common.UpdateMinOwnersCorrect2(provider, ProviderOwners, user_1);
    });
 

});
