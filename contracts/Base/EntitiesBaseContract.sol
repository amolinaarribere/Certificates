// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Entities Base Abstract contract.
    Items -> Entities : exploits the functionality in Item Library.
    Entities -> Owners & Providers & Pools : will be used by Certificate Pools and Providers

Defines a list of entities types where the first one is "Owners" and control the CRUD operations of all the others

EVENTS are copied from ItemLibrary so that they are included in the contracts ABI, otherwise they can be very tricky to retrieve from web3
  
 */

import "../Libraries/Library.sol";
import "../Libraries/AddressLibrary.sol";
import "../Libraries/ItemsLibrary.sol";

abstract contract EntitiesBaseContract{
    using Library for *;
    using AddressLibrary for *;
    using ItemsLibrary for *;

    // EVENTS /////////////////////////////////////////
    // copied from ItemLibrary.......
    event _AddItemValidation(string ItemType,  bytes32 indexed Item,  string Info);
    event _RemoveItemValidation(string ItemType,  bytes32 indexed Item,  string Info);
    event _AddItemRejection(string ItemType,  bytes32 indexed Item,  string Info);
    event _RemoveItemRejection(string ItemType,  bytes32 indexed Item,  string Info);

    // DATA /////////////////////////////////////////
    // owners
    uint256 internal _ownerId;
    uint256 internal _minOwners;

    // Total Owners and other Entities
    ItemsLibrary._ItemsStruct[] internal _Entities;
    string[] internal _entitiesLabel;

    // MODIFIERS /////////////////////////////////////////
    modifier isSomeoneSpecific(address addr, address someone){
        Library.ItIsSomeone(addr, someone);
        _;
    }
    
    modifier isIdCorrect(uint Id, uint length){
        Library.IdCorrect(Id, length);
        _;
    }

    modifier isAnOwner(address addr){
        isAnOwnerFunc(addr);
        _;
    }

    function isAnOwnerFunc(address addr) internal view{
        require(true == isEntity(addr, _ownerId), "EC9-");
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function addEntity(address entity, string calldata entityInfo, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner(msg.sender)
    { 
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsEntity(entity, entityInfo, listId);

        ItemsLibrary.addItem(manipulateItemStruct, itemsstruct, address(this));
    }

    function removeEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner(msg.sender)
    {
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsEntity(entity, "", listId);

        ItemsLibrary.removeItem(manipulateItemStruct, itemsstruct, address(this));
    }

    function validateEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner(msg.sender)
    {
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsEntity(entity, "", listId);

        ItemsLibrary.validateItem(manipulateItemStruct, itemsstruct, address(this));
    }

    function rejectEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner(msg.sender) 
    {
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsEntity(entity, "", listId);

        ItemsLibrary.rejectItem(manipulateItemStruct, itemsstruct, address(this)); 
    }

    function GenerateStructsEntity(address entity, string memory entityInfo, uint listId) internal view
        returns(ItemsLibrary._manipulateItemStruct memory, ItemsLibrary._ItemsStruct storage)
    {
        bytes32 entityInBytes = AddressLibrary.AddressToBytes32(entity);
        uint[] memory listIdArray = new uint[](1);
        listIdArray[0] = listId;
        ItemsLibrary._manipulateItemStruct memory manipulateItemStruct = ItemsLibrary._manipulateItemStruct(entityInBytes, entityInfo, _minOwners, _entitiesLabel[listId], listIdArray);
        ItemsLibrary._ItemsStruct storage itemsstruct =  _Entities[listId];
        return (manipulateItemStruct, itemsstruct);
    }

    function retrieveEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (ItemsLibrary._itemIdentity memory) 
    {
        bytes32 entityInBytes = AddressLibrary.AddressToBytes32(entity);
        return ItemsLibrary.retrieveItem(entityInBytes, _Entities[listId]);
    }

    function retrieveAllEntities(uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
    view returns (bytes32[] memory) 
    {
        return ItemsLibrary.retrieveAllItems(_Entities[listId]);
    }

    function isEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (bool)
    {
        bytes32 entityInBytes = AddressLibrary.AddressToBytes32(entity);
        return ItemsLibrary.isItem(entityInBytes, _Entities[listId]);
    }

    function isEntityPendingToRemoved(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (bool)
    {
        bytes32 entityInBytes = AddressLibrary.AddressToBytes32(entity);
        return ItemsLibrary.isItemPendingToRemoved(entityInBytes, _Entities[listId]);
    }

    function retrievePendingEntities(bool addORemove, uint listId) internal 
         isIdCorrect(listId, _Entities.length)
    view returns (bytes32[] memory)
    {
        bytes32[] memory EntitiesInBytes;
        (EntitiesInBytes) = ItemsLibrary.retrievePendingItems(addORemove, _Entities[listId]);
        return EntitiesInBytes;
    }

    // CALLBACKS /////////////////////////////////////////
    function onItemValidated(bytes32 item, uint256[] calldata ids, bool addOrRemove) public virtual 
        isSomeoneSpecific(msg.sender, address(this))
    {}

    function onItemRejected(bytes32 item, uint256[] calldata ids, bool addOrRemove) public virtual 
        isSomeoneSpecific(msg.sender, address(this))
    {}

}