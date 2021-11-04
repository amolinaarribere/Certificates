// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Provider Factory inherits from Factory.
  Before creating a new Element a payment is made to Treasury.
  Provider Elements are Beacon Proxy, the Beacon implementation address is stored in Manager contract.
 */

 import "../Interfaces/ITreasury.sol";
 import "../Abstract/Factory.sol";

contract ProviderFactory is Factory{
    
    // CONSTRUCTOR /////////////////////////////////////////
    function ProviderFactory_init(address managerContractAddress) public initializer {
        super.Factory_init("Provider", managerContractAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function create(address[] memory owners,  uint256 minOwners, string memory ElementName, string memory ENSName) external override payable
    {
        ITreasury(_managerContract.retrieveTransparentProxies()[1]).pay{value:msg.value}(Library.Prices.NewProviderContract);
        (,address ENSReverseAddress,,) = IENS(_managerContract.retrieveTransparentProxies()[7]).retrieveSettings();
        bytes memory data = abi.encodeWithSignature("Provider_init(address[],uint256,string,string,address)", owners, minOwners, ElementName, ENSName, ENSReverseAddress);
        internalCreate(_managerContract.retrieveBeacons()[1], data, ElementName, ENSName);
    }


}