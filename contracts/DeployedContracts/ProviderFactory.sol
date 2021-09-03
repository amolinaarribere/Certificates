// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Provider Factory inherits from Factory.
  Before creating a new Element a payment is made to Treasury.
  Provider Elements are Beacon Proxy, the Beacon implementation address is stored in Manager contract.
 */

 import "../Interfaces/ITreasury.sol";
 import "../Abstract/Factory.sol";
 import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract ProviderFactory is Factory{
    
    // CONSTRUCTOR /////////////////////////////////////////
    function ProviderFactory_init(address managerContractAddress) public initializer {
        super.Factory_init(managerContractAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function create(address[] memory owners,  uint256 minOwners, string memory ElementName) external override payable
    {
        ITreasury(_managerContract.retrieveTreasuryProxy()).pay{value:msg.value}(Library.Prices.NewProviderContract);
        bytes memory data = abi.encodeWithSignature("Provider_init(address[],uint256,string)", owners, minOwners, ElementName);
        BeaconProxy providerProxy = new BeaconProxy(_managerContract.retrieveProviderBeacon(), data);
        internalCreate(address(providerProxy), "Provider", ElementName);
    }


}