// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./Library.sol";
import "../Libraries/AddressLibrary.sol";

library ItemsLibrary{
    using AddressLibrary for *;
    using Library for *;

    //events
    event _AddItemValidation(bool, string indexed,  bytes32 indexed,  string indexed);
    event _RemoveItemValidation(bool, string indexed,  bytes32 indexed,  string indexed);
    event _AddItemRejection(bool, string indexed,  bytes32 indexed,  string indexed);
    event _RemoveItemRejection(bool, string indexed,  bytes32 indexed,  string indexed);
    
    // Data structure
    struct _itemIdentity{
        bool _activated;
        string _Info;
        uint _id;
        uint _pendingId;
        address[] _Validations;
        address[] _Rejections;
    }

    struct _ItemsStruct{
        mapping(bytes32 => _itemIdentity) _items;
        bytes32[] _activatedItems;
        bytes32[] _pendingItemsAdd;
        bytes32[] _pendingItemsRemove;
    }

    struct _manipulateItemStruct{
        bytes32 item;
        string info;
        uint256 _minSignatures;
        string label;
        uint[] ids;
        bool emitEvent;
    }

    // Auxiliary functions
    function CheckValidations(uint256 signatures, uint256 minSignatures) public pure returns(bool){
        if(signatures < minSignatures) return false;
        return true;
    }

    function RemoveResizePending(bool addOrRemove, bytes32 item, _ItemsStruct storage itemStruct) public
    {
        bytes32[] storage arrayToRemoveResize;
        uint position = itemStruct._items[item]._pendingId;

        if(addOrRemove)arrayToRemoveResize = itemStruct._pendingItemsAdd;
        else arrayToRemoveResize = itemStruct._pendingItemsRemove;

        Library.ArrayRemoveResize(position, arrayToRemoveResize);

        if(position < arrayToRemoveResize.length){
            bytes32 ItemMoved = arrayToRemoveResize[position];
            itemStruct._items[ItemMoved]._pendingId = position;
        }

    }

    function RemoveResizeActivated(bytes32 item, _ItemsStruct storage itemStruct) public
    {
        bytes32[] storage arrayToRemoveResize = itemStruct._activatedItems;
        uint position = itemStruct._items[item]._id;

        Library.ArrayRemoveResize(position, arrayToRemoveResize);

        if(position < arrayToRemoveResize.length){
            bytes32 ItemMoved = arrayToRemoveResize[position];
            itemStruct._items[ItemMoved]._id = position;
        }

    }

    // ADD and REMOVE Functionality
    function addItem(_manipulateItemStruct memory manipulateItemstruct, _ItemsStruct storage itemStruct, address c) public
    {
        bytes32 item = manipulateItemstruct.item;
        string memory info = manipulateItemstruct.info;

        itemStruct._items[item]._Info = info;
        itemStruct._pendingItemsAdd.push(item);
        itemStruct._items[item]._pendingId = itemStruct._pendingItemsAdd.length - 1;
        
        validateItem(manipulateItemstruct, itemStruct, c);
    }
     
    function removeItem(_manipulateItemStruct memory manipulateItemstruct, _ItemsStruct storage itemStruct, address c) public
    {
        bytes32 item = manipulateItemstruct.item;

        itemStruct._pendingItemsRemove.push(item);
        itemStruct._items[item]._pendingId = itemStruct._pendingItemsRemove.length - 1;

        validateItem(manipulateItemstruct, itemStruct, c);
    }

    function validateItem(_manipulateItemStruct memory manipulateItemstruct, _ItemsStruct storage itemStruct, address c) public
    {
        bytes32 item = manipulateItemstruct.item;
        uint _minSignatures = manipulateItemstruct._minSignatures;
        string memory label = manipulateItemstruct.label;
        uint[] memory ids = manipulateItemstruct.ids;
        bool emitEvent = manipulateItemstruct.emitEvent;

        itemStruct._items[item]._Validations.push(msg.sender);

        if(CheckValidations(itemStruct._items[item]._Validations.length, _minSignatures))
        {
            if(isItemPendingToAdded(item, itemStruct)){
                itemStruct._items[item]._activated = true; 
                itemStruct._activatedItems.push(item);
                itemStruct._items[item]._id = itemStruct._activatedItems.length - 1;

                RemoveResizePending(true, item, itemStruct);
                (bool success, ) = c.call(abi.encodeWithSignature("onItemValidated(bytes32,uint256[],bool)", item, ids, true));
                deleteVoters(item, itemStruct);
                if(emitEvent) emit _AddItemValidation(success, label, item, itemStruct._items[item]._Info);
            }
            else{
                RemoveResizeActivated(item, itemStruct);
                RemoveResizePending(false, item, itemStruct);
                (bool success, ) = c.call(abi.encodeWithSignature("onItemValidated(bytes32,uint256[],bool)", item, ids, false));
                if(emitEvent) emit _RemoveItemValidation(success, label, item, itemStruct._items[item]._Info);
                delete(itemStruct._items[item]);
            }   
        }
    }

    function rejectItem(_manipulateItemStruct memory manipulateItemstruct, _ItemsStruct storage itemStruct, address c) public
    {
        bytes32 item = manipulateItemstruct.item;
        uint _minSignatures = manipulateItemstruct._minSignatures;
        string memory label = manipulateItemstruct.label;
        uint[] memory ids = manipulateItemstruct.ids;
        bool emitEvent = manipulateItemstruct.emitEvent;

        itemStruct._items[item]._Rejections.push(msg.sender);

        if(CheckValidations(itemStruct._items[item]._Rejections.length, _minSignatures)){

            if(isItemPendingToAdded(item, itemStruct)){
                RemoveResizePending(true, item, itemStruct);
                (bool success, ) = c.call(abi.encodeWithSignature("onItemRejected(bytes32,uint256[],bool)", item, ids, true)); 
                if(emitEvent) emit _AddItemRejection(success, label, item, itemStruct._items[item]._Info);
                delete(itemStruct._items[item]);
            }
            else{
                RemoveResizePending(false, item, itemStruct);
                (bool success, ) = c.call(abi.encodeWithSignature("onItemRejected(bytes32,uint256[],bool)", item, ids, false));
                deleteVoters(item, itemStruct);
                if(emitEvent) emit _RemoveItemRejection(success, label, item, itemStruct._items[item]._Info);
            }
                
        }
    }

    function deleteVoters(bytes32 item, _ItemsStruct storage itemStruct) public{
        delete(itemStruct._items[item]._Rejections);
        delete(itemStruct._items[item]._Validations);
        itemStruct._items[item]._pendingId = 0;
    }

    // READ Data

    function isItem(bytes32 item, _ItemsStruct storage itemStruct) public view returns(bool){
        return itemStruct._items[item]._activated;
    }

    function isItemPendingToAdded(bytes32 item, _ItemsStruct storage itemStruct) public view returns(bool)
    {
        if(itemStruct._pendingItemsAdd.length > itemStruct._items[item]._pendingId){
            if(item == itemStruct._pendingItemsAdd[itemStruct._items[item]._pendingId]) return true;
        }
        return false;
    }

    function isItemPendingToRemoved(bytes32 item, _ItemsStruct storage itemStruct) public view returns(bool)
    {
        if(itemStruct._pendingItemsRemove.length > itemStruct._items[item]._pendingId){
            if(item == itemStruct._pendingItemsRemove[itemStruct._items[item]._pendingId]) return true;
        }
        return false;
    }

    function retrievePendingItems(bool addORemove, _ItemsStruct storage itemStruct) public view returns (bytes32[] memory, string[] memory)
    {
        bytes32[] memory Items;

        if(addORemove) Items = itemStruct._pendingItemsAdd;
        else Items = itemStruct._pendingItemsRemove;

        string[] memory Items_Info = new string[](Items.length);

        for(uint i=0; i < Items.length; i++){
            (Items_Info[i],) = retrieveItem(Items[i], itemStruct);
        }
        
        return(Items, Items_Info);
    }

    function retrieveItem(bytes32 item, _ItemsStruct storage itemStruct) public view returns (string memory, bool) 
    {
        return (itemStruct._items[item]._Info, isItem(item, itemStruct));
    }

    function retrieveAllItems(_ItemsStruct storage itemStruct) public view returns (bytes32[] memory) 
    {
        return itemStruct._activatedItems;
    }

    function hasVoted(address add, bytes32 item, _ItemsStruct storage itemStruct) public view returns (bool) 
    {
        return (AddressLibrary.FindAddress(add, itemStruct._items[item]._Validations) ||
                AddressLibrary.FindAddress(add, itemStruct._items[item]._Rejections));
    }

}