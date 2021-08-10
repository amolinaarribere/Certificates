// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

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

    // ADD and REMOVE Functionality
    function addItem(_manipulateItemStruct memory manipulateItemstruct, _ItemsStruct storage itemStruct, address c) public
    {
        bytes32 item = manipulateItemstruct.item;
        string memory info = manipulateItemstruct.info;

        itemStruct._items[item]._Info = info;
        itemStruct._pendingItemsAdd.push(item);
        
        validateItem(manipulateItemstruct, itemStruct, c);
    }
     
    function removeItem(_manipulateItemStruct memory manipulateItemstruct, _ItemsStruct storage itemStruct, address c) public
    {
        bytes32 item = manipulateItemstruct.item;

        itemStruct._pendingItemsRemove.push(item);

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

        if(CheckValidations(itemStruct._items[item]._Validations.length, _minSignatures)){

            if(isItemPendingToAdded(item, itemStruct)){
                itemStruct._items[item]._activated = true; 
                itemStruct._activatedItems.push(item);
                itemStruct._pendingItemsAdd = Library.ArrayRemoveResize(Library.FindPosition(item, itemStruct._pendingItemsAdd), itemStruct._pendingItemsAdd);
                (bool success, ) = c.call(abi.encodeWithSignature("onItemValidated(bytes32,uint256[],bool)", item, ids, true));
                deleteVoters(item, itemStruct);
                if(emitEvent) emit _AddItemValidation(success, label, item, itemStruct._items[item]._Info);
            }
            else{
                itemStruct._activatedItems = Library.ArrayRemoveResize(Library.FindPosition(item, itemStruct._activatedItems), itemStruct._activatedItems);
                itemStruct._pendingItemsRemove = Library.ArrayRemoveResize(Library.FindPosition(item, itemStruct._pendingItemsRemove), itemStruct._pendingItemsRemove);
                (bool success, ) = c.call(abi.encodeWithSignature("onItemValidated(bytes32,uint256[],bool)", item, ids, false));
                delete(itemStruct._items[item]);
                if(emitEvent) emit _RemoveItemValidation(success, label, item, itemStruct._items[item]._Info);
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
                itemStruct._pendingItemsAdd = Library.ArrayRemoveResize(Library.FindPosition(item, itemStruct._pendingItemsAdd), itemStruct._pendingItemsAdd);
                (bool success, ) = c.call(abi.encodeWithSignature("onItemRejected(bytes32,uint256[],bool)", item, ids, true));
                delete(itemStruct._items[item]._Info);
                deleteVoters(item, itemStruct); 
                if(emitEvent) emit _AddItemRejection(success, label, item, itemStruct._items[item]._Info);
            }
            else{
                itemStruct._pendingItemsRemove = Library.ArrayRemoveResize(Library.FindPosition(item, itemStruct._pendingItemsRemove), itemStruct._pendingItemsRemove);
                (bool success, ) = c.call(abi.encodeWithSignature("onItemRejected(bytes32,uint256[],bool)", item, ids, false));
                deleteVoters(item, itemStruct);
                if(emitEvent) emit _RemoveItemRejection(success, label, item, itemStruct._items[item]._Info);
            }
                
        }
    }

    function deleteVoters(bytes32 item, _ItemsStruct storage itemStruct) public{
        delete(itemStruct._items[item]._Rejections);
        delete(itemStruct._items[item]._Validations);
    }

    // READ Data

    function isItem(bytes32 item, _ItemsStruct storage itemStruct) public view returns(bool){
        return itemStruct._items[item]._activated;
    }

    function isItemPendingToAdded(bytes32 item, _ItemsStruct storage itemStruct) public view returns(bool)
    {
        bytes32[] memory pendingToBeAdded = itemStruct._pendingItemsAdd;
        for(uint i=0; i < pendingToBeAdded.length; i++){
            if(item == pendingToBeAdded[i]) return true;
        }
        return false;
    }

    function isItemPendingToRemoved(bytes32 item, _ItemsStruct storage itemStruct) public view returns(bool)
    {
        bytes32[] memory pendingToBeRemoved = itemStruct._pendingItemsRemove;
        for(uint i=0; i < pendingToBeRemoved.length; i++){
            if(item == pendingToBeRemoved[i]) return true;
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