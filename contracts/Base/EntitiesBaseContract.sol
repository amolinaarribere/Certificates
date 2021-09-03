// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Entities Base Abstract contract.
    Items -> Entities : exploits the functionality in Item Library.
    Entities -> Owners & Providers & Pools : will be used by Certificate Pools and Providers

Defines a list of entities types where the first one is "Owners" and control the CRUD operations of all the others
  
 */

import "../Libraries/Library.sol";
import "../Libraries/AddressLibrary.sol";
import "../Libraries/ItemsLibrary.sol";

abstract contract EntitiesBaseContract{
    using Library for *;
    using AddressLibrary for *;
    using ItemsLibrary for *;

    // DATA /////////////////////////////////////////
    // owners
    uint256 internal _ownerId;
    uint256 internal _minOwners;

    // Total Owners and other Entities
    ItemsLibrary._ItemsStruct[] internal _Entities;
    string[] internal _entitiesLabel;

    // MODIFIERS /////////////////////////////////////////
    modifier isSomeoneSpecific(address someone){
        require(true == Library.ItIsSomeone(someone), "EC8-");
        _;
    }
    
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "EC1-");
        _;
    }

    modifier isAnOwner(){
        require(true == isEntity(msg.sender, _ownerId), "EC9-");
        _;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function addEntity(address entity, string calldata entityInfo, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner
    { 
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsEntity(entity, entityInfo, listId);

        ItemsLibrary.addItem(manipulateItemStruct, itemsstruct, address(this));
    }

    function removeEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner
    {
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsEntity(entity, "", listId);

        ItemsLibrary.removeItem(manipulateItemStruct, itemsstruct, address(this));
    }

    function validateEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner 
    {
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsEntity(entity, "", listId);

        ItemsLibrary.validateItem(manipulateItemStruct, itemsstruct, address(this));
    }

    function rejectEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner 
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
    view returns (string memory, bool) 
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
    view returns (bytes32[] memory, string[] memory)
    {
        bytes32[] memory EntitiesInBytes;
        string[] memory EntitiesInfo;
        (EntitiesInBytes, EntitiesInfo) = ItemsLibrary.retrievePendingItems(addORemove, _Entities[listId]);
        return(EntitiesInBytes, EntitiesInfo);
    }

    // CALLBACKS /////////////////////////////////////////
    function onItemValidated(bytes32 item, uint256[] calldata ids, bool addOrRemove) public virtual 
        isSomeoneSpecific(address(this))
    {}

    function onItemRejected(bytes32 item, uint256[] calldata ids, bool addOrRemove) public virtual 
        isSomeoneSpecific(address(this))
    {}

}