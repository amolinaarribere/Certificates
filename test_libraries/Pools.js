// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PrivateCertificates = artifacts.require("PrivateCertificatesPool");
var PrivateCertificatesAbi = PrivateCertificates.abi;
const PublicCertificates = artifacts.require("PublicCertificatesPool");
var PublicCertificatesAbi = PublicCertificates.abi;
const Library = artifacts.require("./Libraries/Library");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const Gas = 6721975;
const minOwners = 2;
// providers info
const provider_1_Info = "Provider 1 Info";
const provider_2_Info = "Provider 2 Info";
// owner info
const extra_owner_Info = "Extra Owner";
// certificates
const hash_1 = "0x3fd54831f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
const hash_2 = "0x3fd54832f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
// test constants
const NotAnOwner = new RegExp("EC9");
const OwnerAlreadyvoted = new RegExp("EC5");
const NotAllowedRemoveEntity = new RegExp("EC10");
const MustBeActivated = new RegExp("EC7");
const MinNumberRequired = new RegExp("EC19");
const NotAProvider = new RegExp("EC12");
const CertificateAlreadyExists = new RegExp("EC15");
const NotAllowedToRemoveCertificate = new RegExp("EC14");
const WrongSender = new RegExp("EC8");
const NotSubmittedByCreator = new RegExp("EC4");
const NotEmpty = new RegExp("EC11");


async function AddingOwners(CertPool, Owners, extra_owner){
    await CertPool.methods.addOwner(extra_owner, extra_owner_Info).send({from: Owners[0], gas: Gas}, function(error, result){});
    await CertPool.methods.addOwner(extra_owner, "").send({from: Owners[1], gas: Gas}, function(error, result){});
}

async function AddingOrValidatingProviders(CertPool, Owners, provider_1, provider_2, isPrivate){
    if(isPrivate) await AddingProviders(CertPool, Owners, provider_1, provider_2);
    else await ValidatingProviders(CertPool, Owners, provider_1, provider_2);
}

async function AddingProviders(CertPool, Owners, provider_1, provider_2){
    await CertPool.methods.addProvider(provider_1, provider_1_Info).send({from: Owners[0], gas: Gas}, function(error, result){});
    await CertPool.methods.addProvider(provider_1, "").send({from: Owners[1], gas: Gas}, function(error, result){});
    await CertPool.methods.addProvider(provider_2, provider_2_Info).send({from: Owners[1], gas: Gas}, function(error, result){});
    await CertPool.methods.addProvider(provider_2, "text that will not be updated" + 1).send({from: Owners[2], gas: Gas}, function(error, result){});
}

async function ValidatingProviders(CertPool, Owners, provider_1, provider_2){
    await CertPool.methods.validateProvider(provider_1).send({from: Owners[0], gas: Gas}, function(error, result){});
    await CertPool.methods.validateProvider(provider_1).send({from: Owners[1], gas: Gas}, function(error, result){});
    await CertPool.methods.validateProvider(provider_2).send({from: Owners[1], gas: Gas}, function(error, result){});
    await CertPool.methods.validateProvider(provider_2).send({from: Owners[2], gas: Gas}, function(error, result){});
}

async function AddingCertificate(CertPool, provider_1, provider_2, holder_1, holder_2){
    await CertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
    await CertPool.methods.addCertificate(hash_1, holder_2).send({from: provider_1, gas: Gas}, function(error, result){});
    await CertPool.methods.addCertificate(hash_2, holder_1).send({from: provider_2, gas: Gas}, function(error, result){});
    await CertPool.methods.addCertificate(hash_2, holder_2).send({from: provider_2, gas: Gas}, function(error, result){});
}

async function AddOwnerWrong(CertPool, Owners, extra_owner, user_1){
    // act
    try{
        await CertPool.methods.addOwner(extra_owner, extra_owner_Info).send({from: user_1}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NotAnOwner);
    }
    // act
    try{
        await CertPool.methods.addOwner(extra_owner, extra_owner_Info).send({from: Owners[0], gas: Gas}, function(error, result){});
        await CertPool.methods.addOwner(extra_owner, extra_owner_Info + 1).send({from: Owners[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(OwnerAlreadyvoted);
    }
}

async function AddOwnerCorrect(CertPool, Owners, extra_owner, user_1){
    // act
    await AddingOwners(CertPool, Owners, extra_owner);
    // assert
    let {0:Owner_Extra,1:isOwner} = await CertPool.methods.retrieveOwner(extra_owner).call({from: user_1}, function(error, result){});
    let AllOwners = await CertPool.methods.retrieveAllOwners().call({from: user_1}, function(error, result){});
    Total = AllOwners.length;
    let MinOwners = await CertPool.methods.retrieveMinOwners().call({from: user_1}, function(error, result){});
    expect(Owner_Extra).to.equal(extra_owner_Info);
    expect(isOwner).to.be.true;
    expect(Total).to.equal(4);
    expect(AllOwners[0]).to.equal(Owners[0]);
    expect(AllOwners[1]).to.equal(Owners[1]);
    expect(AllOwners[2]).to.equal(Owners[2]);
    expect(AllOwners[3]).to.equal(extra_owner);
    expect(MinOwners).to.equal(minOwners.toString());
};

async function RemoveOwnerWrong(CertPool, Owners, provider_3, user_1){
    //act
    try{
        await CertPool.methods.removeOwner(Owners[2]).send({from: user_1}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NotAllowedRemoveEntity);
    }
    // act
    try{
        await CertPool.methods.removeOwner(provider_3).send({from: Owners[0]}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(MustBeActivated);
    }
    // act
    try{
        await CertPool.methods.removeOwner(Owners[2]).send({from: Owners[0], gas: Gas}, function(error, result){});
        await CertPool.methods.removeOwner(Owners[2]).send({from: Owners[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(OwnerAlreadyvoted);
    }
    // act
    try{
        await CertPool.methods.removeOwner(Owners[1]).send({from: Owners[0], gas: Gas}, function(error, result){});
        await CertPool.methods.removeOwner(Owners[1]).send({from: Owners[2], gas: Gas}, function(error, result){});
        await CertPool.methods.removeOwner(Owners[2]).send({from: Owners[1], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(MinNumberRequired);
    }
}

async function RemoveOwnerCorrect(CertPool, Owners, user_1){
    // act
    await CertPool.methods.removeOwner(Owners[2]).send({from: Owners[0], gas: Gas}, function(error, result){});
    await CertPool.methods.removeOwner(Owners[2]).send({from: Owners[1], gas: Gas}, function(error, result){});
    // assert
    let All = await CertPool.methods.retrieveAllOwners().call({from: user_1}, function(error, result){});
    let Total = All.length;
    expect(Total).to.equal(2);
};

async function AddProviderWrong(CertPool, Owners, provider_1, user_1, isPrivate){
    if(isPrivate){
        // act
        try{
            await CertPool.methods.addProvider(provider_1, provider_1_Info).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
        // act
        try{
            await CertPool.methods.addProvider(provider_1, provider_1_Info).send({from: Owners[0], gas: Gas}, function(error, result){});
            await CertPool.methods.addProvider(provider_1, provider_1_Info + 1).send({from: Owners[0], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    }
    else{
        // act
        try{
            await CertPool.methods.addProvider(provider_1, provider_1_Info).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(WrongSender);
        }
    }
    
}

async function ValidateProviderWrong(CertPool, Owners, provider_1, provider_2, provider_3, user_1){
    // act
    try{
        await CertPool.methods.validateProvider(provider_1).send({from: user_1}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NotAnOwner);
    }
   // act
    try{
        await CertPool.methods.validateProvider(provider_1).send({from: Owners[0], gas: Gas}, function(error, result){});
        await CertPool.methods.validateProvider(provider_1 + 1).send({from: Owners[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(OwnerAlreadyvoted);
    }
    // act
    try{
        await CertPool.methods.validateProvider(provider_3).send({from: Owners[0]}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NotSubmittedByCreator);
    }
}

async function ValidateProviderCorrect(CertPool, Owners, provider_1, provider_2, user_1){
    // act
    await ValidatingProviders(CertPool, Owners, provider_1, provider_2);
    // assert
    let {0:Provider_1,1:isProvider_1} = await CertPool.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
    let {0:Provider_2,1:isProvider_2} = await CertPool.methods.retrieveProvider(provider_2).call({from: user_1}, function(error, result){});
    let AllProviders = await CertPool.methods.retrieveAllProviders().call({from: user_1}, function(error, result){});
    let Total = AllProviders.length;
    expect(Provider_1).to.equal(provider_1_Info);
    expect(isProvider_1).to.be.true;
    expect(Provider_2).to.equal(provider_2_Info);
    expect(isProvider_2).to.be.true;
    expect(Total).to.equal(2);
    expect(AllProviders[0]).to.equal(provider_1);
    expect(AllProviders[1]).to.equal(provider_2);
}

async function AddProviderCorrect(CertPool, Owners, provider_1, provider_2, user_1){
    // act
    await AddingProviders(CertPool, Owners, provider_1, provider_2);
    // assert
    let {0:Provider_1,1:isProvider_1} = await CertPool.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
    let {0:Provider_2,1:isProvider_2} = await CertPool.methods.retrieveProvider(provider_2).call({from: user_1}, function(error, result){});
    let AllProviders = await CertPool.methods.retrieveAllProviders().call({from: user_1}, function(error, result){});
    let Total = AllProviders.length;
    expect(Provider_1).to.equal(provider_1_Info);
    expect(isProvider_1).to.be.true;
    expect(Provider_2).to.equal(provider_2_Info);
    expect(isProvider_2).to.be.true;
    expect(Total).to.equal(2);
    expect(AllProviders[0]).to.equal(provider_1);
    expect(AllProviders[1]).to.equal(provider_2);
}

async function RemoveProviderWrong(CertPool, Owners, provider_1, provider_2, provider_3, user_1, isPrivate){
    // act
    await AddingOrValidatingProviders(CertPool, Owners, provider_1, provider_2, isPrivate)

    try{
        await CertPool.methods.removeProvider(provider_1).send({from: user_1}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NotAllowedRemoveEntity);
    }
    // act
    try{
        await CertPool.methods.removeProvider(provider_3).send({from: Owners[0]}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(MustBeActivated);
    }
    // act
    try{
        await CertPool.methods.removeProvider(provider_1).send({from: Owners[0], gas: Gas}, function(error, result){});
        await CertPool.methods.removeProvider(provider_1).send({from: Owners[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(OwnerAlreadyvoted);
    }
}

async function RemoveProviderCorrect(CertPool, Owners, provider_1, provider_2, user_1, isPrivate){
    // act
    await AddingOrValidatingProviders(CertPool, Owners, provider_1, provider_2, isPrivate)
    await CertPool.methods.removeProvider(provider_1).send({from: Owners[2], gas: Gas}, function(error, result){});
    await CertPool.methods.removeProvider(provider_1).send({from: Owners[0], gas: Gas}, function(error, result){});
    // assert
    let All = await CertPool.methods.retrieveAllProviders().call({from: user_1}, function(error, result){});
    let Total = All.length;
    expect(Total).to.equal(1);
}

async function AddCertificateWrong(CertPool, Owners, provider_1, provider_2, holder_1, user_1, isPrivate){
    // act
    await AddingOrValidatingProviders(CertPool, Owners, provider_1, provider_2, isPrivate)

    try{
        await CertPool.methods.addCertificate(hash_1, holder_1).send({from: user_1}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NotAProvider);
    }
    // act
    try{
        await CertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        await CertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(CertificateAlreadyExists);
    }
    
}

async function AddCertificateCorrect(CertPool, Owners, provider_1, provider_2, holder_1, holder_2, user_1, isPrivate){
    // act
    await AddingOrValidatingProviders(CertPool, Owners, provider_1, provider_2, isPrivate)
    await AddingCertificate(CertPool, provider_1, provider_2, holder_1, holder_2);
    // assert
    let Provider_1 = await CertPool.methods.retrieveCertificateProvider(hash_1, holder_1).call({from: user_1}, function(error, result){});
    let Provider_1b = await CertPool.methods.retrieveCertificateProvider(hash_1, holder_2).call({from: user_1}, function(error, result){});
    let Provider_2 = await CertPool.methods.retrieveCertificateProvider(hash_2, holder_1).call({from: user_1}, function(error, result){});
    let Provider_2b = await CertPool.methods.retrieveCertificateProvider(hash_2, holder_2).call({from: user_1}, function(error, result){});
    let TotalHolder_1 = await CertPool.methods.retrieveTotalCertificatesByHolder(holder_1).call({from: user_1}, function(error, result){});
    let TotalHolder_2 = await CertPool.methods.retrieveTotalCertificatesByHolder(holder_2).call({from: user_1}, function(error, result){});
    let CertificatesHolder1 = await CertPool.methods.retrieveCertificatesByHolder(holder_1, 0, 2).call({from: user_1}, function(error, result){});
    let CertificatesHolder1b = await CertPool.methods.retrieveCertificatesByHolder(holder_1, 1, 20).call({from: user_1}, function(error, result){});
    let CertificatesHolder2 = await CertPool.methods.retrieveCertificatesByHolder(holder_2, 0, 2).call({from: user_1}, function(error, result){});
    let CertificatesHolder2b = await CertPool.methods.retrieveCertificatesByHolder(holder_2, 0, 1).call({from: user_1}, function(error, result){});
    
    expect(Provider_1).to.equal(provider_1);
    expect(Provider_1b).to.equal(provider_1);
    expect(Provider_2).to.equal(provider_2);
    expect(Provider_2b).to.equal(provider_2);
    expect(TotalHolder_1).to.equal("2");
    expect(TotalHolder_2).to.equal("2");
    expect(CertificatesHolder1[0]).to.equal(hash_1);
    expect(CertificatesHolder1[1]).to.equal(hash_2);
    expect(CertificatesHolder2[0]).to.equal(hash_1);
    expect(CertificatesHolder2[1]).to.equal(hash_2);
    expect(CertificatesHolder1b[0]).to.equal(hash_2);
    expect(CertificatesHolder2b[0]).to.equal(hash_1);
}

async function RemoveCertificateWrong(CertPool, Owners, provider_1, provider_2, holder_1, holder_2, user_1, isPrivate){
    // act
    await AddingOrValidatingProviders(CertPool, Owners, provider_1, provider_2, isPrivate)
    await AddingCertificate(CertPool, provider_1, provider_2, holder_1, holder_2);

    try{
        await CertPool.methods.removeCertificate(hash_1, holder_1).send({from: user_1}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NotAProvider);
    }
    // act
    try{
        await CertPool.methods.removeCertificate(hash_1, holder_1).send({from: provider_2}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NotAllowedToRemoveCertificate);
    }
    
}

async function RemoveCertificateCorrect(CertPool, Owners, provider_1, provider_2, holder_1, holder_2, user_1, isPrivate){
    // act
    await AddingOrValidatingProviders(CertPool, Owners, provider_1, provider_2, isPrivate)
    await AddingCertificate(CertPool, provider_1, provider_2, holder_1, holder_2);
    await CertPool.methods.removeCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
    // assert
    let Total = await CertPool.methods.retrieveTotalCertificatesByHolder(holder_1).call({from: user_1}, function(error, result){});
    expect(Total).to.equal("1");
}


exports.AddOwnerWrong = AddOwnerWrong;
exports.AddOwnerCorrect = AddOwnerCorrect;
exports.RemoveOwnerWrong = RemoveOwnerWrong;
exports.RemoveOwnerCorrect = RemoveOwnerCorrect;
exports.AddProviderWrong = AddProviderWrong;
exports.ValidateProviderWrong = ValidateProviderWrong;
exports.ValidateProviderCorrect = ValidateProviderCorrect;
exports.AddProviderCorrect = AddProviderCorrect;
exports.RemoveProviderWrong = RemoveProviderWrong;
exports.RemoveProviderCorrect = RemoveProviderCorrect;
exports.AddCertificateWrong = AddCertificateWrong;
exports.AddCertificateCorrect = AddCertificateCorrect;
exports.RemoveCertificateWrong = RemoveCertificateWrong;
exports.RemoveCertificateCorrect = RemoveCertificateCorrect;


