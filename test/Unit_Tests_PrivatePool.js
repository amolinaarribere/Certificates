// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PrivateCertificates = artifacts.require("PrivateCertificatesPool");
var PrivateCertificatesAbi = PrivateCertificates.abi;
const Library = artifacts.require("./Libraries/Library");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const Gas = 6721975;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Private Pool",function(accounts){
    var certPoolManager;
    var privateCertPool;
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
    const PrivateOwners = [accounts[0], accounts[5], accounts[9]];
    // providers info
    const provider_1_Info = "Provider 1 Info";
    const provider_2_Info = "Provider 2 Info";
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
        await certPoolManager.createPrivateCertificatesPool(PrivateOwners, minOwners, {from: user_1, value: PrivatePriceWei});
        let response = await certPoolManager.retrievePrivateCertificatesPool(0, {from: user_1});
        const {0: creator, 1: privateCertPoolAddress} = response;
        privateCertPool = new web3.eth.Contract(PrivateCertificatesAbi, privateCertPoolAddress);      
    });

    async function AddingProviders(){
        await privateCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: PrivateOwners[0], gas: Gas}, function(error, result){});
        await privateCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: PrivateOwners[1], gas: Gas}, function(error, result){});
        await privateCertPool.methods.addProvider(provider_2, provider_2_Info).send({from: PrivateOwners[1], gas: Gas}, function(error, result){});
        await privateCertPool.methods.addProvider(provider_2, provider_2_Info).send({from: PrivateOwners[2], gas: Gas}, function(error, result){});
    }

    async function AddingCertificate(){
        await privateCertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        await privateCertPool.methods.addCertificate(hash_1, holder_2).send({from: provider_1, gas: Gas}, function(error, result){});
        await privateCertPool.methods.addCertificate(hash_2, holder_1).send({from: provider_2, gas: Gas}, function(error, result){});
        await privateCertPool.methods.addCertificate(hash_2, holder_2).send({from: provider_2, gas: Gas}, function(error, result){});
    }

    // ****** TESTING Adding Provider ***************************************************************** //

    it("Add Provider WRONG",async function(){
        // act
        try{
            await privateCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await privateCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: PrivateOwners[0], gas: Gas}, function(error, result){});
            await privateCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: PrivateOwners[0], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

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
    });
 

});
