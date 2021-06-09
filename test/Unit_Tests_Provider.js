// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
const Provider = artifacts.require("Provider");
var PublicCertificatesAbi = PublicCertificates.abi;
const Library = artifacts.require("./Libraries/Library");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const Gas = 6721975;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Provider",function(accounts){
    var certPoolManager;
    var publicCertPool;
    var publicCertPoolAddress;
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
    const hash_2 = "0x3fd54832f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
    // test constants
    const NotAnOwner = new RegExp("EC9");
    const OwnerAlreadyvoted = new RegExp("EC5");
    const NotAllowedRemoveEntity = new RegExp("EC10");
    const MustBeActivated = new RegExp("EC7");
    const NotAProvider = new RegExp("EC12");
    const CertificateAlreadyExists = new RegExp("EC15");
    const NotAllowedToRemoveCertificate = new RegExp("EC14");

    beforeEach(async function(){
        certPoolManager = await CertificatesPoolManager.new(PublicOwners, minOwners, PublicPriceWei, PrivatePriceWei, {from: chairPerson});
        provider = await Provider.new(ProviderOwners, minOwners, {from: user_1});
        await certPoolManager.sendProposal(provider.address, provider_1_Info, {from: user_1, value: PublicPriceWei});
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: _publicCertPoolAddress, 1: _chairPerson, 2: _balance} = result;
        publicCertPoolAddress = _publicCertPoolAddress;
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, publicCertPoolAddress);
    });


    // ****** TESTING Adding Provider ***************************************************************** //

    it("Add Pool WRONG",async function(){
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, {from: ProviderOwners[0], gas: Gas});
            await provider.addPool(publicCertPoolAddress, pool_Info, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Add Pool CORRECT",async function(){
        // act
        await provider.addPool(publicCertPoolAddress, pool_Info, {from: ProviderOwners[0], gas: Gas});
        await provider.addPool(publicCertPoolAddress, pool_Info, {from: ProviderOwners[1], gas: Gas});
        // assert
        let _PoolInfo = provider.retrievePool(publicCertPoolAddress);
        console.log(_PoolInfo);
        let _Total = provider.retrieveTotalPools();
        console.log(_Total);
        expect(_PoolInfo).to.match(pool_Info);
        expect(_Total.toNumber()).to.equal(1);
    });
/*
    // ****** TESTING Removing Provider ***************************************************************** //

    it("Removing Provider WRONG",async function(){
        // act
        await AddingProviders();

        try{
            await privateCertPool.methods.removeProvider(provider_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAllowedRemoveEntity);
        }
        // act
        try{
            await privateCertPool.methods.removeProvider(provider_3).send({from: PrivateOwners[0]}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(MustBeActivated);
        }
        // act
        try{
            await privateCertPool.methods.removeProvider(provider_1).send({from: PrivateOwners[0], gas: Gas}, function(error, result){});
            await privateCertPool.methods.removeProvider(provider_1).send({from: PrivateOwners[0], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Removing Provider CORRECT",async function(){
        // act
        await AddingProviders();
        await privateCertPool.methods.removeProvider(provider_1).send({from: PrivateOwners[2], gas: Gas}, function(error, result){});
        await privateCertPool.methods.removeProvider(provider_1).send({from: PrivateOwners[0], gas: Gas}, function(error, result){});
        // assert
        let Total = await privateCertPool.methods.retrieveTotalProviders().call({from: user_1}, function(error, result){});
        expect(Total).to.equal("1");
    });

    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        // act
        await AddingProviders();

        try{
            await privateCertPool.methods.addCertificate(hash_1, holder_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAProvider);
        }
        // act
        try{
            await privateCertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
            await privateCertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CertificateAlreadyExists);
        }
        
    });

    it("Adding Certificate CORRECT",async function(){
        // act
        await AddingProviders();
        await privateCertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        // assert
        let Provider = await privateCertPool.methods.retrieveCertificateProvider(hash_1, holder_1).call({from: user_1}, function(error, result){});
        expect(Provider).to.equal(provider_1);
    });

    // ****** TESTING Removing Certificate ***************************************************************** //

    it("Removing Certificate WRONG",async function(){
        // act
        await AddingProviders();
        await AddingCertificate();

        try{
            await privateCertPool.methods.removeCertificate(hash_1, holder_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAProvider);
        }
        // act
        try{
            await privateCertPool.methods.removeCertificate(hash_1, holder_1).send({from: provider_2}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAllowedToRemoveCertificate);
        }
        
    });

    it("Removing Certificate CORRECT",async function(){
        // act
        await AddingProviders();
        await AddingCertificate();
        await privateCertPool.methods.removeCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
    });*/
 

});
