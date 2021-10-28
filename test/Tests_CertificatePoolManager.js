// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const CertificatesPoolManagerAbi = CertificatesPoolManager.abi;
const Treasury = artifacts.require("Treasury");
const TreasuryAbi = Treasury.abi;
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const PublicCertificatesPoolAbi = PublicCertificatesPool.abi;
const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const PrivatePoolFactory = artifacts.require("PrivatePoolFactory");
const PrivatePoolFactoryAbi = PrivatePoolFactory.abi;
const ProviderFactory = artifacts.require("ProviderFactory");
const ProviderFactoryAbi = ProviderFactory.abi;
const PriceConverter = artifacts.require("PriceConverter");
const PriceConverterAbi = PriceConverter.abi;
const PropositionSettings = artifacts.require("PropositionSettings");
const PropositionSettingsAbi = PropositionSettings.abi;
const ENS = artifacts.require("ENS");
const ENSAbi = ENS.abi;

const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");
const obj = require("../test_libraries/objects.js");
const proposition = require("../test_libraries/Propositions.js");

const PrivatePoolContractName = constants.PrivatePoolContractName;
const PrivatePoolContractVersion = constants.PrivatePoolContractVersion;

const Gas = constants.Gas;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Certificate Pool Manager",function(accounts){
    var certPoolManager;
    var certContract;

    var certisTokenProxy;
    var publicPoolProxy;
    var treasuryProxy;
    var priceConverterProxy;
    var propositionSettingsProxy;
    var ensProxy;
    var privatePoolFactoryProxy;

    var certisToken;
    var publicPool;
    var treasury;
    var priceConverter;
    var propositionSettings;
    var ens;
    var privatePoolFactory;
    var privatePool;
    var providerFactory;
    var provider;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const user_1 = accounts[4];
    const tokenOwner = [accounts[5], accounts[6], accounts[7], accounts[8], accounts[9]];
    const address_0 = "0x0000000000000000000000000000000000000000";
    const address_1 = "0x0000000000000000000000000000000000000001";
    const address_2 = "0x0000000000000000000000000000000000000002";
    const address_3 = "0x0000000000000000000000000000000000000003";
    const address_4 = "0x0000000000000000000000000000000000000004";
    const address_5 = "0x0000000000000000000000000000000000000005";
    const address_6 = "0x0000000000000000000000000000000000000006";
    const address_7 = "0x0000000000000000000000000000000000000007";
    const address_8 = "0x0000000000000000000000000000000000000008";
    const address_9 = "0x0000000000000000000000000000000000000009";
    const address_10 = "0x000000000000000000000000000000000000000a";
    const emptyBytes = "0x";
    const emptyString = "";
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
    const Unauthorized = new RegExp("EC8-");
    const CannotProposeChanges = new RegExp("EC22-");
    const WrongConfig = new RegExp("EC21-");
    const NoPropositionActivated = new RegExp("EC25-");
    const PropositionAlreadyInProgress = new RegExp("EC24-");
    const CanNotVote = new RegExp("EC23-");

    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        certContract = new web3.eth.Contract(CertificatesPoolManagerAbi, certPoolManager.address);
        publicPoolProxy = new web3.eth.Contract(PublicCertificatesPoolAbi, contracts[1][0]);
        treasuryProxy = new web3.eth.Contract(TreasuryAbi, contracts[1][1]);
        certisTokenProxy = new web3.eth.Contract(CertisTokenAbi, contracts[1][2]);
        privatePoolFactoryProxy = new web3.eth.Contract(PrivatePoolFactoryAbi, contracts[1][3]);
        providerFactoryProxy = new web3.eth.Contract(ProviderFactoryAbi, contracts[1][4]);
        priceConverterProxy = new web3.eth.Contract(PriceConverterAbi, contracts[1][5]);
        propositionSettingsProxy = new web3.eth.Contract(PropositionSettingsAbi, contracts[1][6]);
        ensProxy = new web3.eth.Contract(ENSAbi, contracts[1][7]);
        publicPool = contracts[2][0];
        treasury = contracts[2][1];
        certisToken = contracts[2][2];
        privatePoolFactory = contracts[2][3];
        privatePool = contracts[2][4];
        providerFactory = contracts[2][5];
        provider = contracts[2][6];
        priceConverter = contracts[2][7];
        propositionSettings = contracts[2][9];
        ens = contracts[2][10];
    });

    async function checkProxyAddresses( _ppa, _ta, _ca, _ppfa, _pfa, _pco, _ps, _ens){
        let _publicCertPoolAddressProxy = await certPoolManager.retrievePublicCertificatePoolProxy({from: user_1});
        let _treasuryAddressProxy = await certPoolManager.retrieveTreasuryProxy({from: user_1});
        let _certisAddressProxy = await certPoolManager.retrieveCertisTokenProxy({from: user_1});
        let _privatePoolFactoryAddressProxy = await certPoolManager.retrievePrivatePoolFactoryProxy({from: user_1});
        let _providerFactoryAddressProxy = await certPoolManager.retrieveProviderFactoryProxy({from: user_1});
        let _priceConverterAddressProxy = await certPoolManager.retrievePriceConverterProxy({from: user_1});
        let _propositionSettingsAddressProxy = await certPoolManager.retrievePropositionSettingsProxy({from: user_1});
        let _ensAddressProxy = await certPoolManager.retrieveENSProxy({from: user_1});
        
        expect(_ppa).to.equal(_publicCertPoolAddressProxy);
        expect(_ta).to.equal(_treasuryAddressProxy);
        expect(_ca).to.equal(_certisAddressProxy);
        expect(_ppfa).to.equal(_privatePoolFactoryAddressProxy);
        expect(_pfa).to.equal(_providerFactoryAddressProxy);
        expect(_pco).to.equal(_priceConverterAddressProxy);
        expect(_ps).to.equal(_propositionSettingsAddressProxy);
        expect(_ens).to.equal(_ensAddressProxy);
    }

    async function checkImplAddresses( _ppa, _ta, _ca, _ppfa, _prpa, _pfa, _pra, _pco, _ps, _ens, _ppcn, _ppcv){
        let _publicCertPoolAddress = await certPoolManager.retrievePublicCertificatePool({from: user_1});
        let _treasuryAddress = await certPoolManager.retrieveTreasury({from: user_1});
        let _certisAddress = await certPoolManager.retrieveCertisToken({from: user_1});
        let _privatePoolFactoryAddress = await certPoolManager.retrievePrivatePoolFactory({from: user_1});
        let _privatePool = await certPoolManager.retrievePrivatePool({from: user_1});
        let _providerFactoryAddress = await certPoolManager.retrieveProviderFactory({from: user_1});
        let _provider = await certPoolManager.retrieveProvider({from: user_1});
        let _priceConverter = await certPoolManager.retrievePriceConverter({from: user_1});
        let _propositionSettings = await certPoolManager.retrievePropositionSettings({from: user_1});
        let _ensSettings = await certPoolManager.retrieveENS({from: user_1});
        let _PrivatePoolFactoryConfiguration = await privatePoolFactoryProxy.methods.retrieveConfig().call({from: user_1}, function(error, result){});
        
        expect(_ppa).to.equal(_publicCertPoolAddress);
        expect(_ta).to.equal(_treasuryAddress);
        expect(_ca).to.equal(_certisAddress);
        expect(_ppfa).to.equal(_privatePoolFactoryAddress);
        expect(_prpa).to.equal(_privatePool);
        expect(_pfa).to.equal(_providerFactoryAddress);
        expect(_pra).to.equal(_provider);
        expect(_pco).to.equal(_priceConverter);
        expect(_ps).to.equal(_propositionSettings);
        expect(_ens).to.equal(_ensSettings);
        expect(_ppcn).to.equal(_PrivatePoolFactoryConfiguration[1]);
        expect(_ppcv).to.equal(_PrivatePoolFactoryConfiguration[2]);
    }

    async function checkProposition( _ppa, _ta, _ca, _ppfa, _prpa, _pfa, _pra, _pco, _ps, _ens){
        var propositionResult = await certPoolManager.retrieveProposition({from: user_1});
        let {0: _publicAddress, 1: _treasuryAddress, 2: _certisAddress, 3: _privatePoolFactoryAddress, 4: _privatePoolAddress, 5: _providerFactoryAddress, 6: _providerAddress, 7: _priceConverterAddress, 8: _propositionSettingsAddress, 9: _ensAddress} = propositionResult;

        expect(proposition.AddressToBytes32(_ppa)).to.equal(_publicAddress);
        expect(proposition.AddressToBytes32(_ta)).to.equal(_treasuryAddress);
        expect(proposition.AddressToBytes32(_ca)).to.equal(_certisAddress);
        expect(proposition.AddressToBytes32(_ppfa)).to.equal(_privatePoolFactoryAddress);
        expect(proposition.AddressToBytes32(_prpa)).to.equal(_privatePoolAddress);
        expect(proposition.AddressToBytes32(_pfa)).to.equal(_providerFactoryAddress);
        expect(proposition.AddressToBytes32(_pra)).to.equal(_providerAddress);
        expect(proposition.AddressToBytes32(_pco)).to.equal(_priceConverterAddress);
        expect(proposition.AddressToBytes32(_ps)).to.equal(_propositionSettingsAddress);
        expect(proposition.AddressToBytes32(_ens)).to.equal(_ensAddress);  
    }

    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Configuration",async function(){
        // assert
        await checkProxyAddresses(publicPoolProxy._address, treasuryProxy._address, certisTokenProxy._address, privatePoolFactoryProxy._address, providerFactoryProxy._address, priceConverterProxy._address, propositionSettingsProxy._address, ensProxy._address);
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
    });

    it("Retrieve Proposals Details",async function(){
        // act
        await proposition.SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
        await certPoolManager.upgradeContracts(obj.returnUpgradeObject(address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9, address_10,
            emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyString, emptyString), {from: chairPerson, gas: Gas});
        // assert
        await checkProposition(address_1,address_2,address_3,address_4,address_5,address_6,address_7,address_8,address_9,address_10);
        
    });

    // ****** Testing Contracts Configuration ***************************************************************** //

    it("Vote/Propose/Cancel Contracts Configuration WRONG",async function(){
        await proposition.SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
        // act
        try{
            await certPoolManager.upgradeContracts(obj.returnUpgradeObject(address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9, address_10,
                emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyString, emptyString), {from: user_1, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CannotProposeChanges);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner[0], gas: Gas});
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
            await certPoolManager.upgradeContracts(obj.returnUpgradeObject(address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9, address_10,
                emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyString, emptyString), {from: chairPerson, gas: Gas});
            await certPoolManager.voteProposition(false, {from: chairPerson, gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CanNotVote);
        }
        // act
        try{
            await certPoolManager.upgradeContracts(obj.returnUpgradeObject(address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9, address_10,
                emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyString, emptyString), {from: tokenOwner[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(PropositionAlreadyInProgress);
        }
        // act
        try{
            await certPoolManager.cancelProposition({from: tokenOwner[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner[0], gas: Gas});
            await certPoolManager.voteProposition(false, {from: tokenOwner[0], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CanNotVote);
        }
        // act
        try{
            await certPoolManager.voteProposition(false, {from: tokenOwner[1], gas: Gas});
            await certPoolManager.voteProposition(false, {from: tokenOwner[2], gas: Gas});
            await certPoolManager.voteProposition(true, {from: tokenOwner[3], gas: Gas});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        
    });

    it("Vote/Propose/Cancel Contracts Configuration CORRECT",async function(){
        // act
        let contracts = await init.deployImplementations(chairPerson, PublicOwners, minOwners, user_1, certPoolManager.address);
        var NewpublicPool = contracts[0];
        var Newtreasury = contracts[1];
        var NewcertisToken = contracts[2];
        var NewprivatePoolFactory = contracts[3]; 
        var NewprivatePool = contracts[4]; 
        var NewproviderFactory = contracts[5]; 
        var Newprovider = contracts[6];
        var NewpriceConverter = contracts[7];
        var NewpropositionSettings = contracts[9];
        var Newens = contracts[10];
        var NewPrivatePoolContractName = "New Private Pool Contract Name";
        var NewPrivatePoolContractVersion = "1.34";

        await proposition.SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);

        // Update contracts Not validated
        await certPoolManager.upgradeContracts(obj.returnUpgradeObject(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings, Newens,
            emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, NewPrivatePoolContractName, NewPrivatePoolContractVersion), {from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(false, {from: tokenOwner[0], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(false, {from: tokenOwner[1], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(false, {from: tokenOwner[2], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        
        // Update contracts cancelled
        await certPoolManager.upgradeContracts(obj.returnUpgradeObject(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings, Newens,
            emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, NewPrivatePoolContractName, NewPrivatePoolContractVersion), {from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[0], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[1], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.cancelProposition({from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);

        // Update contracts validated (address(0)) nothing done
        await certPoolManager.upgradeContracts(obj.returnUpgradeObject(address_0, address_0, address_0, address_0, address_0, address_0, address_0, address_0, address_0, address_0,
            emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyString, emptyString), {from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[0], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[1], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[2], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);


        // Update contracts validated
        await certPoolManager.upgradeContracts(obj.returnUpgradeObject(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings, Newens,
            emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, NewPrivatePoolContractName, NewPrivatePoolContractVersion), {from: chairPerson, gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[0], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[1], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[2], gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings, Newens, NewPrivatePoolContractName, NewPrivatePoolContractVersion);

        // Rollback to original contracts
        await certPoolManager.upgradeContracts(obj.returnUpgradeObject(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens,
            emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes, PrivatePoolContractName, PrivatePoolContractVersion), {from: chairPerson, gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings,  Newens, NewPrivatePoolContractName, NewPrivatePoolContractVersion);
        await certPoolManager.voteProposition(false, {from: tokenOwner[0], gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings,  Newens, NewPrivatePoolContractName, NewPrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[1], gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings,  Newens, NewPrivatePoolContractName, NewPrivatePoolContractVersion);
        await certPoolManager.voteProposition(false, {from: tokenOwner[2], gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings,  Newens, NewPrivatePoolContractName, NewPrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[3], gas: Gas});
        await checkImplAddresses(NewpublicPool, Newtreasury, NewcertisToken, NewprivatePoolFactory, NewprivatePool, NewproviderFactory, Newprovider, NewpriceConverter, NewpropositionSettings,  Newens, NewPrivatePoolContractName, NewPrivatePoolContractVersion);
        await certPoolManager.voteProposition(true, {from: tokenOwner[4], gas: Gas});
        await checkImplAddresses(publicPool, treasury, certisToken, privatePoolFactory, privatePool, providerFactory, provider, priceConverter, propositionSettings, ens, PrivatePoolContractName, PrivatePoolContractVersion);
        
    });

});
