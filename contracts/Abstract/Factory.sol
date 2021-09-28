// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Factory abstract contracts :
    Common functionality to Private Pool and Provider Factories contracts for
    Building Elements (Private Pools / Providers) also known as clones :
    - Creator (user address)
    - Element (Beacon Proxy address)

    Emits an event everytime an Element is created :
    - Factory Name (Private Pool, Provider)
    - Element id in the array
    - Creator
    - Element
    - Element Name

 Elements cannot be removed once created.

 Factory is initializable (will be accessed via a Transparent Proxy)
 Factory is Managed by main Manager contract
 */

 import '../Interfaces/IFactory.sol';
 import "../Base/ManagedBaseContract.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


abstract contract Factory is IFactory, Initializable, ManagedBaseContract{
    using Library for *;

     // EVENTS /////////////////////////////////////////
    event _NewElement(string Factory, uint256 Id, address indexed Creator, address Element, string Name);
    event _NewContractName(string Factory, string Name);
    event _NewContractVersion(string Factory, string Version);

    // DATA /////////////////////////////////////////
    string internal _FactoryName;
    string internal _ContractName;
    string internal _ContractVersion;

    // Private Certificates Pool structure
    struct _ElementStruct{
        address _creator;
        address _ElementProxyAddress;
    } 

    _ElementStruct[] internal _Elements;

    // MODIFIERS /////////////////////////////////////////
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "EC1-");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function Factory_init(string memory factoryName, address managerContractAddress) public initializer {
        super.ManagedBaseContract_init(managerContractAddress);
        _FactoryName = factoryName;
        _ContractName = "";
        _ContractVersion = "";
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function internalCreate(address beaconProxyAddress, string memory elementName) internal
    {
        _ElementStruct memory element = _ElementStruct(msg.sender, beaconProxyAddress);
        _Elements.push(element);

        emit _NewElement(_FactoryName, _Elements.length - 1, element._creator, element._ElementProxyAddress, elementName);
    }

    function updateContractName(string memory contractName) external override
        isFromManagerContract()
    {
        _ContractName = contractName;
        emit _NewContractName(_FactoryName, _ContractName);
    }

    function updateContractVersion(string memory contractVersion) external override
        isFromManagerContract()
    {
        _ContractVersion = contractVersion;
        emit _NewContractVersion(_FactoryName, _ContractVersion);
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

    function retrieveConfig() external override view returns (string memory, string memory, string memory)
    {
        return(_FactoryName, _ContractName, _ContractVersion);
    }

}