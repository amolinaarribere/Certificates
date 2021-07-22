// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Libraries/Library.sol";
 import "../Libraries/AddressLibrary.sol";

contract EntitiesBaseContract{
    using Library for *;
    using AddressLibrary for *;

    //Actions that can be performed on entities
    enum Actions{
        Add,
        Remove
    }

    //Structures
    struct _entityIdentity{
        bool _activated;
        string _Info;
        address[] _AddValidated;
        address[] _RemoveValidated;
    }

    struct _entityStruct{
        mapping(address => _entityIdentity) _entities;
        address[] _activatedEntities;
        address[] _pendingEntitiesAdd;
        address[] _pendingEntitiesRemove;
    }

    //events
    event _AddEntityValidationIdEvent(string, address);
    event _RemoveEntityValidationIdEvent(string, address);

    // owners
    uint _ownerId;
    uint256 _minOwners;

    // Total Owners and other Entities
    _entityStruct[] _Entities;
    string[] _entitiesLabel;

    // modifiers
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "EC1");
        _;
    }

    modifier isAnOwner(){
        require(true == isEntity(msg.sender, _ownerId), "EC9");
        _;
    }

    modifier isAnOwnerOrHimself(address entity){
        require(true == isEntity(msg.sender, _ownerId) || msg.sender == entity, "EC10");
        _;
    }

    modifier HasNotAlreadyVoted(Actions action, _entityIdentity memory Entity){
        if(Actions.Add == action) require(false == AddressLibrary.FindAddress(msg.sender, Entity._AddValidated), "EC5");
        else require(false == AddressLibrary.FindAddress(msg.sender, Entity._RemoveValidated), "EC5");
        _;
    }
    
    modifier isEntityActivated(bool YesOrNo, address entity, uint listId){
        if(false == YesOrNo) require(false == isEntity(entity, listId), "EC6");
        else require(true == isEntity(entity, listId), "EC7");
        _;
    }

    // Entities functions
    function addEntity(address entity, string memory entityInfo, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner 
        isEntityActivated(false, entity, listId) 
        HasNotAlreadyVoted(Actions.Add, _Entities[listId]._entities[entity])
    {
        if(0 == _Entities[listId]._entities[entity]._AddValidated.length){
            _Entities[listId]._entities[entity]._Info = entityInfo;
            _Entities[listId]._pendingEntitiesAdd.push(entity);
        } 

        _Entities[listId]._entities[entity]._AddValidated.push(msg.sender);

        if(Library.CheckValidations(_Entities[listId]._entities[entity]._AddValidated.length, _minOwners)){
            _Entities[listId]._entities[entity]._activated = true; 
            _Entities[listId]._activatedEntities.push(entity);
            _Entities[listId]._pendingEntitiesAdd = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(entity, _Entities[listId]._pendingEntitiesAdd), _Entities[listId]._pendingEntitiesAdd);

            emit _AddEntityValidationIdEvent(_entitiesLabel[listId], entity);
        }
    }

    function removeEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwnerOrHimself(entity) 
        isEntityActivated(true, entity, listId)
        HasNotAlreadyVoted(Actions.Remove, _Entities[listId]._entities[entity])
    {

        if(0 == _Entities[listId]._entities[entity]._RemoveValidated.length){
            _Entities[listId]._pendingEntitiesRemove.push(entity);
        } 

        _Entities[listId]._entities[entity]._RemoveValidated.push(msg.sender);

        if(msg.sender == entity || Library.CheckValidations(_Entities[listId]._entities[entity]._RemoveValidated.length, _minOwners)){
            _Entities[listId]._activatedEntities = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(entity, _Entities[listId]._activatedEntities), _Entities[listId]._activatedEntities);
            _Entities[listId]._pendingEntitiesRemove = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(entity, _Entities[listId]._pendingEntitiesRemove), _Entities[listId]._pendingEntitiesRemove);
            delete(_Entities[listId]._entities[entity]);
            emit _RemoveEntityValidationIdEvent(_entitiesLabel[listId], entity);
        }  
       
    }

    function retrieveEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (string memory, bool) 
    {
        return (_Entities[listId]._entities[entity]._Info, isEntity(entity, listId));
    }

    function retrieveAllEntities(uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
    view returns (address[] memory) 
    {
        return _Entities[listId]._activatedEntities;
    }

    function isEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (bool){
        return _Entities[listId]._entities[entity]._activated;
    }

    function retrievePendingEntities(bool addORemove, uint listId) internal 
         isIdCorrect(listId, _Entities.length)
    view returns (address[] memory, string[] memory){
        address[] memory Entities;

        if(addORemove) Entities = _Entities[listId]._pendingEntitiesAdd;
        else Entities = _Entities[listId]._pendingEntitiesRemove;

        string[] memory Entities_Info = new string[](_Entities.length);

        for(uint i=0; i < Entities.length; i++){
            (Entities_Info[i],) = retrieveEntity(Entities[i], listId);
        }
        
        return(Entities, Entities_Info);
    }

}