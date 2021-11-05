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

const PrivatePoolFactory = artifacts.require("PrivatePoolFactory");
const PrivatePoolFactoryAbi = PrivatePoolFactory.abi;
const emptyBytes = "0x";
const address_0 = "0x0000000000000000000000000000000000000000";


async function SplitTokenSupply(CT, tokenOwner, chairPerson){
    await CT.methods.transfer(tokenOwner[0], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[1], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[2], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[3], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[4], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
}

async function checkProposition(contractAddress, Values, user_1){
    var propositionResult = await contractAddress.methods.retrieveProposition().call({from: user_1});
    for(let i=0; i < propositionResult.length; i++){
        expect(Values[i]).to.equal(propositionResult[i]);
    }
}

async function returnContractManagerSettings(contractAddress, user_1){
    let TransparentProxies = await contractAddress.methods.retrieveTransparentProxies().call({from: user_1});
    let TransparentImpl = await contractAddress.methods.retrieveTransparentProxiesImpl().call({from: user_1});
    let BeaconsImpl = await contractAddress.methods.retrieveBeaconsImpl().call({from: user_1});


    let _publicCertPoolAddress = TransparentImpl[0];
    let _treasuryAddress = TransparentImpl[1];
    let _certisAddress = TransparentImpl[2];
    let _privatePoolFactoryAddress = TransparentImpl[3];
    let _privatePool = BeaconsImpl[0];
    let _providerFactoryAddress = TransparentImpl[4];
    let _provider = BeaconsImpl[1];
    let _priceConverter = TransparentImpl[5];
    let _propositionSettings = TransparentImpl[6];
    let _ensSettings = TransparentImpl[7];


    let _privatePoolFactoryProxyAddress = TransparentProxies[3];
    privatePoolFactoryProxy = new web3.eth.Contract(PrivatePoolFactoryAbi, _privatePoolFactoryProxyAddress);

    let _PrivatePoolFactoryConfiguration = await privatePoolFactoryProxy.methods.retrieveConfig().call({from: user_1}, function(error, result){});

    return [_publicCertPoolAddress, 
        _treasuryAddress,
        _certisAddress,
        _privatePoolFactoryAddress,
        _providerFactoryAddress,
        _priceConverter,
        _propositionSettings,
        _ensSettings,
        _privatePool,
        _provider,
        emptyBytes, 
        emptyBytes, 
        emptyBytes, 
        emptyBytes, 
        emptyBytes, 
        emptyBytes, 
        emptyBytes, 
        emptyBytes, 
        _PrivatePoolFactoryConfiguration[1],
        _PrivatePoolFactoryConfiguration[2]]
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

async function checkContracts(contractAddress, ContractsBytes, user_1){
    let _Contracts = await returnContractManagerSettings(contractAddress, user_1);

    expect(aux.Bytes32ToAddress(ContractsBytes[0])).to.equal(_Contracts[0]);
    expect(aux.Bytes32ToAddress(ContractsBytes[1])).to.equal(_Contracts[1]);
    expect(aux.Bytes32ToAddress(ContractsBytes[2])).to.equal(_Contracts[2]);
    expect(aux.Bytes32ToAddress(ContractsBytes[3])).to.equal(_Contracts[3]);
    expect(aux.Bytes32ToAddress(ContractsBytes[4])).to.equal(_Contracts[4]);
    expect(aux.Bytes32ToAddress(ContractsBytes[5])).to.equal(_Contracts[5]);
    expect(aux.Bytes32ToAddress(ContractsBytes[6])).to.equal(_Contracts[6]);
    expect(aux.Bytes32ToAddress(ContractsBytes[7])).to.equal(_Contracts[7]);
    expect(aux.Bytes32ToAddress(ContractsBytes[8])).to.equal(_Contracts[8]);
    expect(aux.Bytes32ToAddress(ContractsBytes[9])).to.equal(_Contracts[9]);
    expect(aux.BytesToString(ContractsBytes[18])).to.equal(_Contracts[18]);
    expect(aux.BytesToString(ContractsBytes[19])).to.equal(_Contracts[19]);

}

async function checkAdmin(contractAddress, addressBytes, user_1){
    let _managerAddress =  await contractAddress.methods.retrieveManager().call({from: user_1}, function(error, result){});
    expect(aux.Bytes32ToAddress(addressBytes[0])).to.equal(_managerAddress);
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

async function Config_ContractsManager_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues){
    await Config_CommonProposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues);
};

async function Config_ContractsManager_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues){
    let result = await returnContractManagerSettings(contractAddress, user_1);
    let InitValue = [aux.AddressToBytes32(result[0]),
        aux.AddressToBytes32(result[1]),
        aux.AddressToBytes32(result[2]),
        aux.AddressToBytes32(result[3]),
        aux.AddressToBytes32(result[4]),
        aux.AddressToBytes32(result[5]),
        aux.AddressToBytes32(result[6]),
        aux.AddressToBytes32(result[7]),
        aux.AddressToBytes32(result[8]),
        aux.AddressToBytes32(result[9]),
        result[10],
        result[12],
        result[12],
        result[13],
        result[14],
        result[15],
        result[16],
        result[17],
        aux.StringToBytes(result[18]),
        aux.StringToBytes(result[19]),
    ];
    await Config_CommonProposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues, InitValue, checkContracts);
   
};

async function Config_Admin_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues){
    await Config_CommonProposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues);
    // act
    try{
        await contractAddress.methods.sendProposition([address_0, emptyBytes, address_0]).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(WrongConfig);
    }
};

async function Config_Admin_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues){
    let _managerAddress =  await contractAddress.methods.retrieveManager().call({from: user_1}, function(error, result){});
    let InitValue = [aux.AddressToBytes32(_managerAddress), emptyBytes, contractAddress._address];
    await Config_CommonProposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson, NewValues, InitValue, checkAdmin);
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

async function Check_Proposition_Details(contractAddress, certisTokenProxy, chairPerson, tokenOwner, user_1, PropositionValues){
    // act
    await SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
    await contractAddress.methods.sendProposition(PropositionValues).send({from: chairPerson, gas: Gas});
    // assert
    await checkProposition(contractAddress, PropositionValues, user_1);
}

async function Check_Votes_Reassignment(contractAddress, certisTokenProxy, chairPerson, tokenOwner, user_1, PropositionValues){
    // act
    await SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
    await contractAddress.methods.sendProposition(PropositionValues).send({from: chairPerson, gas: Gas});
    let propID = await contractAddress.methods.retrieveNextPropId().call({from: user_1, gas: Gas}, function(error, result){});
    await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});

    // assert
    let Votes00 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[0]).call({from: user_1, gas: Gas}, function(error, result){});
    let Votes10 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[1]).call({from: user_1, gas: Gas}, function(error, result){});
    let Votes20 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[2]).call({from: user_1, gas: Gas}, function(error, result){});
    expect(parseInt(Votes00)).to.equal(TotalTokenSupply / 5);
    expect(parseInt(Votes10)).to.equal(0);
    expect(parseInt(Votes20)).to.equal(0);

    await certisTokenProxy.methods.transfer(tokenOwner[2], (TotalTokenSupply / 10)).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
    await certisTokenProxy.methods.transfer(tokenOwner[2], (TotalTokenSupply / 10)).send({from: tokenOwner[1], gas: Gas}, function(error, result){});

    let Votes01 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[0]).call({from: user_1, gas: Gas}, function(error, result){});
    let Votes11 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[1]).call({from: user_1, gas: Gas}, function(error, result){});
    let Votes21 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[2]).call({from: user_1, gas: Gas}, function(error, result){});
    expect(parseInt(Votes01)).to.equal(TotalTokenSupply / 10);
    expect(parseInt(Votes11)).to.equal(0);
    expect(parseInt(Votes21)).to.equal(TotalTokenSupply / 10);

    await certisTokenProxy.methods.transfer(tokenOwner[2], (TotalTokenSupply / 10)).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
    await certisTokenProxy.methods.transfer(tokenOwner[2], (TotalTokenSupply / 10)).send({from: tokenOwner[1], gas: Gas}, function(error, result){});

    let Votes02 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[0]).call({from: user_1, gas: Gas}, function(error, result){});
    let Votes12 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[1]).call({from: user_1, gas: Gas}, function(error, result){});
    let Votes22 = await contractAddress.methods.retrieveVotesForVoter(propID - 1, tokenOwner[2]).call({from: user_1, gas: Gas}, function(error, result){});
    expect(parseInt(Votes02)).to.equal(0);
    expect(parseInt(Votes12)).to.equal(0);
    expect(parseInt(Votes22)).to.equal(TotalTokenSupply / 5);

}

exports.Config_Proposition_Wrong = Config_Proposition_Wrong;
exports.Config_Proposition_Correct = Config_Proposition_Correct;
exports.Config_PriceConverter_Wrong = Config_PriceConverter_Wrong;
exports.Config_PriceConverter_Correct = Config_PriceConverter_Correct;
exports.Config_ENS_Wrong = Config_ENS_Wrong;
exports.Config_ENS_Correct = Config_ENS_Correct;
exports.Config_Treasury_Wrong = Config_Treasury_Wrong;
exports.Config_Treasury_Correct = Config_Treasury_Correct;
exports.Config_ContractsManager_Wrong = Config_ContractsManager_Wrong;
exports.Config_ContractsManager_Correct = Config_ContractsManager_Correct;
exports.Config_Admin_Wrong = Config_Admin_Wrong;
exports.Config_Admin_Correct = Config_Admin_Correct;
exports.SplitTokenSupply = SplitTokenSupply;
exports.Check_Proposition_Details = Check_Proposition_Details;
exports.Check_Votes_Reassignment = Check_Votes_Reassignment;