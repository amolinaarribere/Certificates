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

async function GetENSAddresses(network, deployer, MockENSRegistry, MockENSResolver, MockReverseRegistry){
    var ENSRegistryAddress = MainENSRegistryAddress;
    var ENSResolverAddress = "";
    var ENSReverseRegistryAddress = MainENSReverseRegistryAddress;

    if("mainnet" != network &&
       "ropsten" != network &&
       "rinkeby" != network &&
       "goerli" != network)
    {
        await deployer.deploy(MockENSRegistry);
        let MockENSRegistryInstance = await MockENSRegistry.deployed();
        console.log("MockENSRegistryInstance deployed : " + MockENSRegistryInstance.address);

        await deployer.deploy(MockENSResolver, MockENSRegistryInstance.address);
        let MockENSResolverInstance = await MockENSResolver.deployed();
        console.log("MockENSResolverInstance deployed : " + MockENSResolverInstance.address);

        await deployer.deploy(MockReverseRegistry, MockENSRegistryInstance.address, MockENSResolverInstance.address);
        let MockReverseRegistryInstance = await MockReverseRegistry.deployed();
        console.log("MockReverseRegistryInstance deployed : " + MockReverseRegistryInstance.address);

        ENSRegistryAddress = MockENSRegistryInstance.address;
        ENSResolverAddress = MockENSResolverInstance.address;
        ENSReverseRegistryAddress = MockReverseRegistryInstance.address;

    }

    return [ENSRegistryAddress, ENSResolverAddress, ENSReverseRegistryAddress];
}

async function initializeENS(network, MockENSRegistry, ENSRegistryAddress, web3, account, ENSContractAddress, ENSResolverAddress, ENSReverseRegistryAddress, reverseHashName, ethHashName, aljomoarEthHashName, blockcertsAljomoarEthHashName, Gas){
    if("mainnet" != network &&
       "ropsten" != network &&
       "rinkeby" != network &&
       "goerli" != network)
    {
        const MockENSRegistryAbi = MockENSRegistry.abi;
        let mockENSRegistryContract = new web3.eth.Contract(MockENSRegistryAbi, ENSRegistryAddress);

        // Reverse Registry Ownership Assignment
        await mockENSRegistryContract.methods.setSubnodeOwner("0x0000000000000000000000000000000000000000", web3.utils.sha3('reverse'), account).send({from: account, gas: Gas});
        await mockENSRegistryContract.methods.setSubnodeOwner(reverseHashName, web3.utils.sha3('addr'), ENSReverseRegistryAddress).send({from: account, gas: Gas});
    
        // Provider and PrivatePool Ownership Assignment
        await mockENSRegistryContract.methods.setSubnodeOwner("0x0000000000000000000000000000000000000000", web3.utils.sha3('eth'), account).send({from: account, gas: Gas});
        await mockENSRegistryContract.methods.setSubnodeOwner(ethHashName, web3.utils.sha3('aljomoar'), account).send({from: account, gas: Gas});
        await mockENSRegistryContract.methods.setSubnodeOwner(aljomoarEthHashName, web3.utils.sha3('blockcerts'), account).send({from: account, gas: Gas});
        await mockENSRegistryContract.methods.setSubnodeRecord(blockcertsAljomoarEthHashName, web3.utils.sha3('provider'), ENSContractAddress, ENSResolverAddress, 0).send({from: account, gas: Gas});
        await mockENSRegistryContract.methods.setSubnodeRecord(blockcertsAljomoarEthHashName, web3.utils.sha3('privatepool'), ENSContractAddress, ENSResolverAddress, 0).send({from: account, gas: Gas});
        
        console.log("ENS Domains initialized");
    }
  }

exports.GetChainLinkAddress = GetChainLinkAddress;
exports.GetENSAddresses = GetENSAddresses;
exports.initializeENS = initializeENS;