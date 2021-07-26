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

    //events
    event _AddEntityValidationIdEvent(string indexed,  address indexed,  string indexed);
    event _RemoveEntityValidationIdEvent(string indexed,  address indexed,  string indexed);
    event _AddEntityRejectionIdEvent(string indexed,  address indexed,  string indexed);
    event _RemoveEntityRejectionIdEvent(string indexed,  address indexed,  string indexed);

    //Actions that can be performed on entities
    /*enum Actions{
        Add,
        Remove
    }*/

    //Structures
    struct _entityIdentity{
        bool _activated;
        string _Info;
        address[] _Validations;
        address[] _Rejections;
    }

    struct _entityStruct{
        mapping(address => _entityIdentity) _entities;
        address[] _activatedEntities;
        address[] _pendingEntitiesAdd;
        address[] _pendingEntitiesRemove;
    }

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
    
    modifier HasNotAlreadyVoted(_entityIdentity memory Entity){
        require(false == AddressLibrary.FindAddress(msg.sender, Entity._Validations) &&
            false == AddressLibrary.FindAddress(msg.sender, Entity._Rejections), "EC5");
        _;
    }
    
    modifier isEntityActivated(bool YesOrNo, address entity, uint listId){
        if(false == YesOrNo) require(false == isEntity(entity, listId), "EC6");
        else require(true == isEntity(entity, listId), "EC7");
        _;
    }

    modifier isEntityPending(bool YesOrNo, address entity, uint listId){
        if(false == YesOrNo) require(false == isEntityPendingToAdded(entity, listId) && 
                                    false == isEntityPendingToRemoved(entity, listId), "EC27");
        else require(true == isEntityPendingToAdded(entity, listId) || 
                    true == isEntityPendingToRemoved(entity, listId), "EC28");
        _;
    }

    modifier isEntityPendingToAdd(bool YesOrNo, address entity, uint listId){
        if(false == YesOrNo) require(false == isEntityPendingToAdded(entity, listId), "EC27");
        else require(true == isEntityPendingToAdded(entity, listId), "EC28");
        _;
    }

    modifier isEntityPendingToRemove(bool YesOrNo, address entity, uint listId){
        if(false == YesOrNo) require(false == isEntityPendingToRemoved(entity, listId), "EC27");
        else require(true == isEntityPendingToRemoved(entity, listId), "EC28");
        _;
    }

    // Entities functions
    function addEntity(address entity, string calldata entityInfo, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isEntityActivated(false, entity, listId) 
        isEntityPendingToAdd(false, entity, listId)
    { 
        _Entities[listId]._entities[entity]._Info = entityInfo;
        _Entities[listId]._pendingEntitiesAdd.push(entity);
        
        validateEntity(entity, listId);
    }

    function removeEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isEntityActivated(true, entity, listId)
        isEntityPendingToRemove(false, entity, listId)
    {
        _Entities[listId]._pendingEntitiesRemove.push(entity);

        validateEntity(entity, listId);
    }

    function validateEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner 
        isEntityPending(true, entity, listId)
        HasNotAlreadyVoted(_Entities[listId]._entities[entity])
    {
         _Entities[listId]._entities[entity]._Validations.push(msg.sender);

         if(Library.CheckValidations(_Entities[listId]._entities[entity]._Validations.length, _minOwners)){

                if(isEntityPendingToAdded(entity, listId)){
                    _Entities[listId]._entities[entity]._activated = true; 
                    _Entities[listId]._activatedEntities.push(entity);
                    _Entities[listId]._pendingEntitiesAdd = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(entity, _Entities[listId]._pendingEntitiesAdd), _Entities[listId]._pendingEntitiesAdd);
                    onEntityValidated(entity, listId, true);
                    deleteVoters(entity, listId);
                    emit _AddEntityValidationIdEvent(_entitiesLabel[listId], entity, _Entities[listId]._entities[entity]._Info);
                }
                else{
                    _Entities[listId]._activatedEntities = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(entity, _Entities[listId]._activatedEntities), _Entities[listId]._activatedEntities);
                    _Entities[listId]._pendingEntitiesRemove = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(entity, _Entities[listId]._pendingEntitiesRemove), _Entities[listId]._pendingEntitiesRemove);
                    onEntityValidated( entity, listId, false);
                    delete(_Entities[listId]._entities[entity]);
                    emit _RemoveEntityValidationIdEvent(_entitiesLabel[listId], entity, _Entities[listId]._entities[entity]._Info);
                }

                
            }
        
    }

    function rejectEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner 
        isEntityPending(true, entity, listId)
        HasNotAlreadyVoted(_Entities[listId]._entities[entity])
    {
         _Entities[listId]._entities[entity]._Rejections.push(msg.sender);

         if(Library.CheckValidations(_Entities[listId]._entities[entity]._Rejections.length, _minOwners)){

                if(isEntityPendingToAdded(entity, listId)){
                    _Entities[listId]._pendingEntitiesAdd = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(entity, _Entities[listId]._pendingEntitiesAdd), _Entities[listId]._pendingEntitiesAdd);
                    onEntityRejected(entity, listId, true);
                    delete(_Entities[listId]._entities[entity]._Info);
                    deleteVoters(entity, listId); 
                    emit _AddEntityRejectionIdEvent(_entitiesLabel[listId], entity, _Entities[listId]._entities[entity]._Info);
                }
                else{
                    _Entities[listId]._pendingEntitiesRemove = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(entity, _Entities[listId]._pendingEntitiesRemove), _Entities[listId]._pendingEntitiesRemove);
                    onEntityRejected(entity, listId, false);
                    deleteVoters(entity, listId);
                    emit _RemoveEntityRejectionIdEvent(_entitiesLabel[listId], entity, _Entities[listId]._entities[entity]._Info);
                }

                
            }
        
    }

    function deleteVoters(address entity, uint listId) internal{
        delete(_Entities[listId]._entities[entity]._Rejections);
        delete(_Entities[listId]._entities[entity]._Validations);
    }

    function onEntityValidated(address entity, uint listId, bool addOrRemove) internal virtual{}

    function onEntityRejected(address entity, uint listId, bool addOrRemove) internal virtual{}

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

    function isEntityPendingToAdded(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (bool){

        address[] memory pendingToBeAdded = _Entities[listId]._pendingEntitiesAdd;
        for(uint i=0; i < pendingToBeAdded.length; i++){
            if(entity == pendingToBeAdded[i]) return true;
        }
        return false;
    }

    function isEntityPendingToRemoved(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (bool){

        address[] memory pendingToBeRemoved = _Entities[listId]._pendingEntitiesRemove;
        for(uint i=0; i < pendingToBeRemoved.length; i++){
            if(entity == pendingToBeRemoved[i]) return true;
        }
        return false;
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