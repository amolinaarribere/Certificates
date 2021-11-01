const constants = require("./constants.js");
const aux = require("./auxiliaries.js");

const TotalTokenSupply = constants.TotalTokenSupply;
const Gas = constants.Gas;

// test constants
const Unauthorized = new RegExp("EC8-");
const CannotProposeChanges = new RegExp("EC22-");
const WrongConfig = new RegExp("EC21-");
const NoPropositionActivated = new RegExp("EC25-");
const PropositionAlreadyInProgress = new RegExp("EC24-");
const CanNotVote = new RegExp("EC23-");


async function SplitTokenSupply(CT, tokenOwner, chairPerson){
    await CT.methods.transfer(tokenOwner[0], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[1], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[2], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[3], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[4], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
}

// checks

async function checkPriceConverter(contractAddress, addressBytes, user_1){
    let _registryAddress =  await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    expect(aux.Bytes32ToAddress(addressBytes[0])).to.equal(_registryAddress);
}

async function checkPropositionSettings(contractAddress, propBytes, user_1){
    let _propSettings =  await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    for(let i=0; i < 3; i++){
        expect(aux.Bytes32ToInt(propBytes[i])).to.equal(parseInt(_propSettings[i]));
    }
}

async function checkENS(contractAddress, ENSBytes, user_1){
    let _ENS =  await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    expect(aux.Bytes32ToAddress(ENSBytes[0])).to.equal(_ENS[0]);
    expect(aux.Bytes32ToAddress(ENSBytes[1])).to.equal(_ENS[1]);
    expect(ENSBytes[2]).to.equal(_ENS[2]);
    expect(ENSBytes[3]).to.equal(_ENS[3]);
}

async function checkPrice(contractAddress, PricesBytes, user_1){
    let _Prices =  await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    for(let i=0; i < 5; i++){
        expect(aux.Bytes32ToInt(PricesBytes[i])).to.equal(parseInt(_Prices[i]));
    }

}

// tests

async function Config_Proposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose){
    await Config_CommonProposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, [aux.IntToBytes32(PropositionLifeTime), aux.IntToBytes32(PropositionThresholdPercentage), aux.IntToBytes32(minPercentageToPropose)]);
    // act
    try{
        await contractAddress.methods.sendProposition([aux.IntToBytes32(PropositionLifeTime), aux.IntToBytes32(101), aux.IntToBytes32(minPercentageToPropose)]).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(WrongConfig);
    }
    // act
    try{
        await contractAddress.methods.sendProposition([aux.IntToBytes32(PropositionLifeTime), aux.IntToBytes32(PropositionThresholdPercentage), aux.IntToBytes32(101)]).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(WrongConfig);
    }
    
    
};

async function Config_Proposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose){
    let _propositionSettings =  await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    let NewValues = [aux.IntToBytes32(PropositionLifeTime), aux.IntToBytes32(PropositionThresholdPercentage), aux.IntToBytes32(minPercentageToPropose)];
    let InitValue = [aux.IntToBytes32(_propositionSettings[0]), aux.IntToBytes32(_propositionSettings[1]), aux.IntToBytes32(_propositionSettings[2])];
    await Config_CommonProposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues, InitValue, checkPropositionSettings);
   
};

async function Config_PriceConverter_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, address_1){
    await Config_CommonProposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, [aux.AddressToBytes32(address_1)]);
};

async function Config_PriceConverter_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, address_1){
    let _registryAddress =  await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    let NewValues = [aux.AddressToBytes32(address_1)];
    let InitValue = [aux.AddressToBytes32(_registryAddress)];
    await Config_CommonProposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues, InitValue, checkPriceConverter);
};

async function Config_ENS_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, address_1, address_2, node_1, node_2){
    await Config_CommonProposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, [aux.AddressToBytes32(address_1), aux.AddressToBytes32(address_2), node_1, node_2]);
};

async function Config_ENS_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, address_1, address_2, node_1, node_2){
    let _ENSSettings =  await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    let NewValues = [aux.AddressToBytes32(address_1), aux.AddressToBytes32(address_2), node_1, node_2];
    let InitValue = [aux.AddressToBytes32(_ENSSettings[0]), aux.AddressToBytes32(_ENSSettings[1]), _ENSSettings[2], _ENSSettings[3]];
    await Config_CommonProposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues, InitValue, checkENS);

   
};

async function Config_Treasury_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundPriceUSD){
    await Config_CommonProposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, [aux.IntToBytes32(PublicPriceUSD), aux.IntToBytes32(PrivatePriceUSD), aux.IntToBytes32(ProviderPriceUSD), aux.IntToBytes32(CertificatePriceUSD), aux.IntToBytes32(OwnerRefundPriceUSD)]);
    // act
    try{
        await contractAddress.methods.sendProposition([aux.IntToBytes32(PublicPriceUSD), aux.IntToBytes32(PrivatePriceUSD), aux.IntToBytes32(ProviderPriceUSD), aux.IntToBytes32(CertificatePriceUSD), aux.IntToBytes32(PublicPriceUSD + 1)]).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(WrongConfig);
    }
    
};

async function Config_Treasury_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundPriceUSD ){
    let _price =  await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    let NewValues =  [aux.IntToBytes32(PublicPriceUSD), aux.IntToBytes32(PrivatePriceUSD), aux.IntToBytes32(ProviderPriceUSD), aux.IntToBytes32(CertificatePriceUSD), aux.IntToBytes32(OwnerRefundPriceUSD)];
    let InitValue = [aux.IntToBytes32(_price[0]), aux.IntToBytes32(_price[1]), aux.IntToBytes32(_price[2]), aux.IntToBytes32(_price[3]), aux.IntToBytes32(_price[4])];
    await Config_CommonProposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues, InitValue, checkPrice);
   
};

/////////////////////

async function Config_CommonProposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues){
    // act
    await SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
    try{
        await contractAddress.methods.sendProposition(NewValues).send({from: user_1, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(CannotProposeChanges);
    }
    // act
    try{
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NoPropositionActivated);
    }
    // act
    try{
        await contractAddress.methods.cancelProposition().send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NoPropositionActivated);
    }
    // act
    try{
        await contractAddress.methods.sendProposition(NewValues).send({from: chairPerson, gas: Gas}, function(error, result){});
        await contractAddress.methods.voteProposition(false).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(CanNotVote);
    }
    // act
    try{
        await contractAddress.methods.cancelProposition().send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(Unauthorized);
    }
    // act
    try{
        await contractAddress.methods.sendProposition(NewValues).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(PropositionAlreadyInProgress);
    }
    // act
    try{
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(CanNotVote);
    }
    // act
    try{
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[3], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NoPropositionActivated);
    }
    
};

async function Config_CommonProposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues, InitValue, checkFunction){
    // act
    await SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
 
    // Rejected 
    await contractAddress.methods.sendProposition(NewValues).send({from: chairPerson, gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.voteProposition(false).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
 
    // Cancelled
    await contractAddress.methods.sendProposition(NewValues).send({from: chairPerson, gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.voteProposition(true).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.voteProposition(true).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.cancelProposition().send({from: chairPerson, gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
 
    // Validated
    await contractAddress.methods.sendProposition(NewValues).send({from: chairPerson, gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.voteProposition(true).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.voteProposition(true).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    await contractAddress.methods.voteProposition(true).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, NewValues, user_1);
 
    // Validated again
    await contractAddress.methods.sendProposition(InitValue).send({from: chairPerson, gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, NewValues, user_1);
    await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, NewValues, user_1);
    await contractAddress.methods.voteProposition(true).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, NewValues, user_1);
    await contractAddress.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, NewValues, user_1);
    await contractAddress.methods.voteProposition(true).send({from: tokenOwner[3], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, NewValues, user_1);
    await contractAddress.methods.voteProposition(true).send({from: tokenOwner[4], gas: Gas}, function(error, result){});
    await checkFunction(contractAddress, InitValue, user_1);
    
 };

exports.Config_Proposition_Wrong = Config_Proposition_Wrong;
exports.Config_Proposition_Correct = Config_Proposition_Correct;
exports.Config_PriceConverter_Wrong = Config_PriceConverter_Wrong;
exports.Config_PriceConverter_Correct = Config_PriceConverter_Correct;
exports.Config_ENS_Wrong = Config_ENS_Wrong;
exports.Config_ENS_Correct = Config_ENS_Correct;
exports.Config_Treasury_Wrong = Config_Treasury_Wrong;
exports.Config_Treasury_Correct = Config_Treasury_Correct;
exports.SplitTokenSupply = SplitTokenSupply;