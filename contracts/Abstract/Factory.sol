// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import '../Interfaces/IFactory.sol';
 import "../Base/ManagedBaseContract.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


abstract contract Factory is IFactory, Initializable, ManagedBaseContract{
    using Library for *;

     // EVENTS /////////////////////////////////////////
    event _NewElement(string indexed, uint256, address indexed, address, string indexed);

    // DATA /////////////////////////////////////////
    // Private Certificates Pool structure
    struct _ElementStruct{
        address _creator;
        address _ElementProxyAddress;
    } 

    _ElementStruct[] _Elements;

    // MODIFIERS /////////////////////////////////////////
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "EC1");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function Factory_init(address managerContractAddress) public initializer {
        super.ManagedBaseContract_init(managerContractAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function internalCreate(address beaconProxyAddress, string memory eventLabel, string memory elementName) internal
    {
        _ElementStruct memory element = _ElementStruct(msg.sender, beaconProxyAddress);
        _Elements.push(element);

        emit _NewElement(eventLabel, _Elements.length - 1, element._creator, element._ElementProxyAddress, elementName);
    }

    function retrieve(uint Id) external override
        isIdCorrect(Id, _Elements.length)
    view returns (address, address)
    {
        return(_Elements[Id]._creator, _Elements[Id]._ElementProxyAddress);
    }

    function retrieveTotal() external override view returns (uint)
    {
        return(_Elements.length);
    }

}