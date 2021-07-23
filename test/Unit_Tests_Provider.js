// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out
const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
const Provider = artifacts.require("Provider");
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
    var certisToken;
    var publicCertPool;
    var publicCertPoolAddress;
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
    // providers info
    const provider_1_Info = "Provider 1 Info";
    const pool_Info = "Public Pool";
    // certificates
    const hash_1 = "0x3fd54831f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
    // test constants
    const NotAnOwner = new RegExp("EC9");
    const OwnerAlreadyvoted = new RegExp("EC5");
    const NotAllowedRemoveEntity = new RegExp("EC10");
    const MustBeActivated = new RegExp("EC7");
    const NotAllowedToRemoveCertificate = new RegExp("EC14");
    const NotEnoughFunds = new RegExp("EC2");

    beforeEach(async function(){
        // Public Pool creation and provider subscription
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        certisToken = contracts[1];
        publicCertPool = contracts[2];
        provider = await Provider.new(ProviderOwners, minOwners, provider_1_Info, {from: user_1, value: (2 * CertificatePriceWei) + PublicPriceWei});
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: _publicCertPoolAddress, 1: _treasuryAddress, 2: _certisAddress, 3: _privatePoolGeneratorAddress, 4: _chairPerson, 5: _balance} = result;
        publicCertPoolAddress = _publicCertPoolAddress;
    });

    async function AddProvider(){
        await publicCertPool.addProvider(provider.address, provider_1_Info, {from: user_1, value: PublicPriceWei, gas: Gas});
        await ValidateProvider();
    }

    async function ValidateProvider(){
        await publicCertPool.validateProvider(provider.address, {from: PublicOwners[0], gas: Gas});
        await publicCertPool.validateProvider(provider.address, {from: PublicOwners[1], gas: Gas});
    }

    async function SubscribingToPublicPool(){
        await provider.subscribeToPublicPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: ProviderOwners[0], gas: Gas});
        await provider.subscribeToPublicPool(publicCertPoolAddress, pool_Info, 0, 0, {from: ProviderOwners[1], gas: Gas}); 
        ValidateProvider();
    }

    async function AddingCertificates(){
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[0], gas: Gas});
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[1], gas: Gas});
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[2], gas: Gas});
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[1], gas: Gas});
    }

    async function CheckPool(){
        let {0:_PoolInfo,1:_isPool,2:_AddCertificatePrice} = await provider.retrievePool(publicCertPoolAddress, {from: user_1});
        let _Pools = await provider.retrieveAllPools({from: user_1});
        let _Total = _Pools.length;
        expect(_PoolInfo).to.equal(pool_Info);
        expect(_isPool).to.be.true;
        expect(_AddCertificatePrice.toString()).to.be.equal(CertificatePriceWei.toString());
        expect(_Total).to.equal(1);
        expect(_Pools[0]).to.equal(publicCertPoolAddress);
    }

    // ****** TESTING Subscribing Pool ***************************************************************** //

    it("Subscribe Pool WRONG 1",async function(){
        // act
        try{
            await provider.subscribeToPublicPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: user_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.subscribeToPublicPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: ProviderOwners[0], gas: Gas});
            await provider.subscribeToPublicPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: ProviderOwners[0], gas: Gas});
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
            await provider.subscribeToPublicPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei - 1, {from: ProviderOwners[1], gas: Gas});
            await provider.subscribeToPublicPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, PublicPriceWei, {from: ProviderOwners[2], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
    });

    it("Subscribe Pool CORRECT",async function(){
        // act
        let InitBalance = parseInt(await web3.eth.getBalance(provider.address));
        await SubscribingToPublicPool();
        let FinalBalance = parseInt(await web3.eth.getBalance(provider.address));
        // assert
        await CheckPool();
        expect(InitBalance - PublicPriceWei).to.equal(FinalBalance);
    });

    // ****** TESTING Adding Pool ***************************************************************** //

    it("Add Pool WRONG",async function(){
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, {from: ProviderOwners[0], gas: Gas});
            await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, {from: ProviderOwners[0], gas: Gas});
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
        await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, {from: ProviderOwners[0], gas: Gas});
        await provider.addPool(publicCertPoolAddress, pool_Info, CertificatePriceWei, {from: ProviderOwners[1], gas: Gas});
        // assert
        await CheckPool();
    });

    // ****** TESTING Removing Pool ***************************************************************** //

    it("Removing Pool WRONG",async function(){
        // act
        await SubscribingToPublicPool();

        try{
            await provider.removePool(publicCertPoolAddress, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAllowedRemoveEntity);
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
            await provider.removePool(publicCertPoolAddress, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Removing Pool CORRECT",async function(){
        // act
        await SubscribingToPublicPool();
        await provider.removePool(publicCertPoolAddress, {from: ProviderOwners[2], gas: Gas});
        await provider.removePool(publicCertPoolAddress, {from: ProviderOwners[0], gas: Gas});
        // assert
        let _All = await provider.retrieveAllPools({from: user_1});
        let _Total = _All.length;
        expect(_Total).to.equal(0);
    });

    
    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        // act
        await SubscribingToPublicPool();

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
            await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, {from: ProviderOwners[1], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Adding Certificate CORRECT",async function(){
        // act
        await SubscribingToPublicPool();
        await AddingCertificates();
    });

    // ****** TESTING Removing Certificate ***************************************************************** //

    it("Removing Certificate WRONG",async function(){
        // act
        await SubscribingToPublicPool();
        await AddingCertificates();

        try{
            await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[2], gas: Gas});
            await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[2], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
        
    });

    it("Removing Certificate CORRECT",async function(){
        // act
        await SubscribingToPublicPool();
        await AddingCertificates();
        await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[2], gas: Gas});
        await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, {from: ProviderOwners[0], gas: Gas});
    });
 

});
