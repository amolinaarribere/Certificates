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
    const randomPoolAddress = accounts[0];
    var provider;
    var nonce;
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
    const NonceAlreadyUsed = new RegExp("EC20");

    beforeEach(async function(){
        // Public Pool creation and provider subscription
        certPoolManager = await CertificatesPoolManager.new(PublicOwners, minOwners, PublicPriceWei, PrivatePriceWei, {from: chairPerson});
        provider = await Provider.new(ProviderOwners, minOwners, {from: user_1});
        await certPoolManager.sendProposal(provider.address, provider_1_Info, {from: user_1, value: PublicPriceWei});
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: _publicCertPoolAddress, 1: _chairPerson, 2: _balance} = result;
        publicCertPoolAddress = _publicCertPoolAddress;
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, publicCertPoolAddress); 
        nonce = 0;
        await publicCertPool.methods.validateProvider(provider.address, nonce).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
        await publicCertPool.methods.validateProvider(provider.address, nonce + 1).send({from: PublicOwners[1], gas: Gas}, function(error, result){});
        nonce = 2;
         
    });

    async function AddingPool(_nonce){
        await provider.addPool(publicCertPoolAddress, pool_Info, _nonce, {from: ProviderOwners[0], gas: Gas});
        await provider.addPool(publicCertPoolAddress, pool_Info, _nonce, {from: ProviderOwners[1], gas: Gas}); 
    }

    async function AddingCertificates(_nonce){
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_1, _nonce, {from: ProviderOwners[0], gas: Gas});
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_1, _nonce, {from: ProviderOwners[1], gas: Gas});
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, _nonce, {from: ProviderOwners[2], gas: Gas});
        await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, _nonce + 1, {from: ProviderOwners[1], gas: Gas});
    }


    // ****** TESTING Adding Provider ***************************************************************** //

    it("Add Pool WRONG",async function(){
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, nonce, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await provider.addPool(publicCertPoolAddress, pool_Info, nonce, {from: ProviderOwners[0], gas: Gas});
            await provider.addPool(publicCertPoolAddress, pool_Info, nonce + 1, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
        // act
        try{
            var wrong_nonce = await provider.retrieveHighestNonceForAddress(ProviderOwners[0]);
            await provider.addPool(randomPoolAddress, pool_Info, wrong_nonce, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NonceAlreadyUsed);
        }
    });

    it("Add Pool CORRECT",async function(){
        // act
        await AddingPool(nonce);
        // assert
        let {0:_PoolInfo,1:_isPool} = await provider.retrievePool(publicCertPoolAddress, {from: user_1});
        let _Total = await provider.retrieveTotalPools({from: user_1});
        let _Pools = await provider.retrieveAllPools({from: user_1});
        expect(_PoolInfo).to.equal(pool_Info);
        expect(_isPool).to.be.true;
        expect(_Total.toNumber()).to.equal(1);
        expect(_Pools[0]).to.equal(publicCertPoolAddress);
    });

    // ****** TESTING Removing Provider ***************************************************************** //

    it("Removing Pool WRONG",async function(){
        // act
        await AddingPool(nonce);

        try{
            await provider.removePool(publicCertPoolAddress, nonce, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAllowedRemoveEntity);
        }
        // act
        try{
            await provider.removePool(accounts[0], nonce + 2, {from: ProviderOwners[0]});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(MustBeActivated);
        }
         // act
         try{
            var wrong_nonce = await provider.retrieveHighestNonceForAddress(ProviderOwners[0]);
            await provider.removePool(publicCertPoolAddress, wrong_nonce, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NonceAlreadyUsed);
        }
        // act
        try{
            await provider.removePool(publicCertPoolAddress, nonce + 2, {from: ProviderOwners[0], gas: Gas});
            await provider.removePool(publicCertPoolAddress, nonce + 3, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Removing Pool CORRECT",async function(){
        // act
        await AddingPool(nonce);
        await provider.removePool(publicCertPoolAddress, nonce + 2, {from: ProviderOwners[2], gas: Gas});
        await provider.removePool(publicCertPoolAddress, nonce + 2, {from: ProviderOwners[0], gas: Gas});
        // assert
        let _Total = await provider.retrieveTotalPools({from: user_1});
        expect(_Total.toNumber()).to.equal(0);
    });

    
    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        // act
        await AddingPool(nonce);

        try{
            await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, nonce, {from: user_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            var wrong_nonce = await provider.retrieveHighestNonceForAddress(ProviderOwners[0]);
            await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, wrong_nonce, {from: ProviderOwners[1], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NonceAlreadyUsed);
        }
        // act
        try{
            await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, nonce + 2, {from: ProviderOwners[1], gas: Gas});
            await provider.addCertificate(publicCertPoolAddress, hash_1, holder_2, nonce + 3, {from: ProviderOwners[1], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Adding Certificate CORRECT",async function(){
        // act
        await AddingPool(nonce);
        await AddingCertificates(nonce + 2);
    });

    // ****** TESTING Removing Certificate ***************************************************************** //

    it("Removing Certificate WRONG",async function(){
        // act
        await AddingPool(nonce);
        await AddingCertificates(nonce + 2);

        try{
            await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, nonce, {from: user_1});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            var wrong_nonce = await provider.retrieveHighestNonceForAddress(ProviderOwners[0]);
            await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, wrong_nonce, {from: ProviderOwners[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NonceAlreadyUsed);
        }
        // act
        try{
            await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, nonce + 3, {from: ProviderOwners[2], gas: Gas});
            await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, nonce + 4, {from: ProviderOwners[2], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
        
    });

    it("Removing Certificate CORRECT",async function(){
        // act
        await AddingPool(nonce);
        await AddingCertificates(nonce + 2);
        await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, nonce + 3, {from: ProviderOwners[2], gas: Gas});
        await provider.removeCertificate(publicCertPoolAddress, hash_1, holder_1, nonce + 4, {from: ProviderOwners[0], gas: Gas});
    });
 

});
