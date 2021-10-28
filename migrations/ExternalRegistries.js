const MainnetChainLinkRegistryAddress = "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"
const KovanChainLinkRegistryAddress = "0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0"

const MainENSRegistryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
const MainENSReverseRegistryAddress = "0x6F628b68b30Dc3c17f345c9dbBb1E483c2b7aE5c"



async function GetChainLinkAddress(network, deployer, MockChainLinkFeedRegistry, rate, MockDecimals){

    var ChainLinkRegistryAddress = MainnetChainLinkRegistryAddress;

    if("kovan" == network){
        ChainLinkRegistryAddress = KovanChainLinkRegistryAddress;
    }
    else if("mainnet" != network)
    {
        await deployer.deploy(MockChainLinkFeedRegistry, rate, MockDecimals);
        let MockChainLinkFeedRegistryInstance = await MockChainLinkFeedRegistry.deployed();
        console.log("MockChainLinkFeedRegistry deployed : " + MockChainLinkFeedRegistryInstance.address);
        ChainLinkRegistryAddress = MockChainLinkFeedRegistryInstance.address
    }

    return ChainLinkRegistryAddress;
  
}



function GetENSAddresses(network, deployer, MockENSRegistry, MockENSResolver, MockReverseRegistry){
    var ENSRegistryAddress = MainENSRegistryAddress;
    var ENSReverseRegistryAddress = MainENSReverseRegistryAddress;

    if("mainnet" != network &&
       "ropsten" != network &&
       "rinkeby" != network &&
       "goerli" != network)
    {
        await deployer.deploy(MockENSResolver);
        let MockENSResolverInstance = await MockENSResolver.deployed();
        console.log("MockENSResolverInstance deployed : " + MockENSResolverInstance.address);

        await deployer.deploy(MockENSRegistry);
        let MockENSRegistryInstance = await MockENSRegistry.deployed();
        console.log("MockENSRegistryInstance deployed : " + MockENSRegistryInstance.address);

        await deployer.deploy(MockReverseRegistry);
        let MockReverseRegistryInstance = await MockReverseRegistry.deployed();
        console.log("MockReverseRegistryInstance deployed : " + MockReverseRegistryInstance.address);


        ENSRegistryAddress = MockENSRegistryInstance.address
        ENSReverseRegistryAddress = MockReverseRegistryInstance.address
    }

    return [ENSRegistryAddress, ENSReverseRegistryAddress];
}

exports.GetChainLinkAddress = GetChainLinkAddress;
exports.GetENSAddresses = GetENSAddresses;