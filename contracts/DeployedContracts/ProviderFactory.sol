// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Treasury.sol";
 import "../Libraries/Library.sol";
 import "../Abstract/Factory.sol";
 import "./Proxies/ProviderProxy.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ProviderFactory is Initializable, Factory{
    using Library for *;
    
    // CONSTRUCTOR /////////////////////////////////////////
    function ProviderFactory_init(address managerContractAddress) public initializer {
        super.Factory_init(managerContractAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function create(address[] memory owners,  uint256 minOwners, string memory ElementName) external override payable
    {
        Treasury(_managerContract.retrieveTreasuryProxy()).pay{value:msg.value}(Library.Prices.NewProviderContract);
        bytes memory data = abi.encodeWithSignature("Provider_init(address[],uint256,string)", owners, minOwners, ElementName);
        ProviderProxy providerProxy = new ProviderProxy(_managerContract.retrieveProviderBeacon(), data);
        _ElementStruct memory element = _ElementStruct(msg.sender, address(providerProxy));
        _Elements.push(element);

        emit _NewElement("Provider", _Elements.length - 1, element._creator, element._ElementProxyAddress);
    }


}