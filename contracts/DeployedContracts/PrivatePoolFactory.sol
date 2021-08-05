// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Treasury.sol";
 import "../Libraries/Library.sol";
 import "../Abstract/Factory.sol";
 import "./Proxies/PrivateCertificatesPoolProxy.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PrivatePoolFactory is Initializable, Factory{
    using Library for *;

    // CONSTRUCTOR /////////////////////////////////////////
    function PrivatePoolFactory_init(address managerContractAddress) public initializer {
        super.Factory_init(managerContractAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function create(address[] memory owners,  uint256 minOwners, string memory ElementName) external override payable
    {
        Treasury(_managerContract.retrieveTreasuryProxy()).pay{value:msg.value}(Library.Prices.NewPool);
        bytes memory data = abi.encodeWithSignature("PrivateCertPool_init(address[],uint256)", owners, minOwners);
        PrivateCertificatesPoolProxy certificatePoolProxy = new PrivateCertificatesPoolProxy(_managerContract.retrievePrivatePoolBeacon(), data);
        _ElementStruct memory element = _ElementStruct(msg.sender, address(certificatePoolProxy));
        _Elements.push(element);

        emit _NewElement("Private Pool", _Elements.length - 1, element._creator, element._ElementProxyAddress);
    }


}