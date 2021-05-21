// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

library Library{
    //Actions that can be performed on entities
    enum Actions{
        Add,
        Update,
        Remove
    }

    //Structures
    struct _entityIdentity{
        bool _activated;
        bytes _Info;
        uint256 _updatedTimes;
        address[] _AddValidated;
        address[] _RemoveValidated;
        address[] _UpdateValidated;
    }

    struct _entityStruct{
        mapping(address => _entityIdentity) _entities;
        address[] _activatedEntities;
    }


    // modifier
    modifier HasNotAlreadyVoted(Actions action, _entityIdentity memory Entity){
        NotAlreadyVoted(action, Entity);
        _;
    }
    
    modifier isEntityActivated(bool YesOrNo, _entityIdentity memory Entity){
        EntityActivated(YesOrNo, Entity);
        _;
    }

    modifier isIdCorrect(uint Id, uint length){
        require(true == IdCorrect(Id, length), "provided Id is wrong");
        _;
    }

    // auxiliary functions
    function NotAlreadyVoted(Actions action, _entityIdentity memory Entity) public view{
        string memory message = "Owner has already voted";
        if(Actions.Update == action) require(false == FindAddress(msg.sender, Entity._UpdateValidated), message);
        else if(Actions.Add == action) require(false == FindAddress(msg.sender, Entity._AddValidated), message);
        else require(false == FindAddress(msg.sender, Entity._RemoveValidated), message);
    }
    
    function EntityActivated(bool YesOrNo, _entityIdentity memory Entity) public pure{
        if(false == YesOrNo) require(false == isEntity(Entity), "Entity already activated");
        else require(true == isEntity(Entity), "Entity must be activated");
    }
    
    function IdCorrect(uint Id, uint length) public pure returns (bool){
        return (length > Id);
    }

    function FindAddress(address add, address[] memory list) internal pure returns (bool){
        for(uint i=0; i < list.length; i++){
            if(add == list[i]) return true;
        }

        return false;
    }

    function FindAddressPosition(address add, address[] memory list) internal pure returns (uint){
        for(uint i=0; i < list.length; i++){
            if(add == list[i]) return i;
        }

        return list.length + 1;
    }

    function ArrayRemoveResize(uint index, address[] memory array) internal 
        isIdCorrect(index, array.length)
    pure returns(address[] memory) 
    {
        for (uint i = index; i < array.length-1; i++){
            array[i] = array[i+1];
        }
        
        delete array[array.length-1];
        
        return array;
    }

    function CheckValidations(uint256 signatures, uint256 minSignatures) internal pure returns(bool){
        if(signatures < minSignatures) return false;
        return true;
    }

    // functions for entities
    function addEntity(address entity, bytes memory entityInfo, _entityStruct storage Entities, uint256 minSignatures) internal 
        isEntityActivated(false, Entities._entities[entity]) 
        HasNotAlreadyVoted(Actions.Add, Entities._entities[entity])
    {
        if(0 == Entities._entities[entity]._AddValidated.length && 0 == Entities._entities[entity]._Info.length) Entities._entities[entity]._Info = entityInfo;

        Entities._entities[entity]._AddValidated.push(msg.sender);

        if(CheckValidations(Entities._entities[entity]._AddValidated.length, minSignatures)){
            Entities._entities[entity]._activated = true; 
            Entities._activatedEntities.push(entity);
        }
    }

    function removeEntity(address entity, _entityStruct storage Entities, uint256 minSignatures) internal 
        isEntityActivated(true, Entities._entities[entity])
        HasNotAlreadyVoted(Actions.Remove, Entities._entities[entity])
    {
        Entities._entities[entity]._RemoveValidated.push(msg.sender);

        if(msg.sender == entity || CheckValidations(Entities._entities[entity]._RemoveValidated.length, minSignatures)){
            ArrayRemoveResize(FindAddressPosition(entity, Entities._activatedEntities), Entities._activatedEntities);
            delete(Entities._entities[entity]);
        }  
       
    }

    function updateEntity(address entity, bytes memory entityInfo, _entityStruct storage Entities, uint256 minSignatures) internal 
        isEntityActivated(true, Entities._entities[entity])
        HasNotAlreadyVoted(Actions.Update, Entities._entities[entity])
    {   
        Entities._entities[entity]._UpdateValidated.push(msg.sender); 

        if(CheckValidations(Entities._entities[entity]._UpdateValidated.length, minSignatures)){
            Entities._entities[entity]._Info = entityInfo;
            Entities._entities[entity]._updatedTimes += 1;
            delete(Entities._entities[entity]._UpdateValidated);
        }       
    }

    function retrieveEntity(address entity, _entityStruct storage Entities) internal 
        isEntityActivated(true, Entities._entities[entity])
    view returns (bytes memory) 
    {
        return Entities._entities[entity]._Info;
    }

    function retrieveAllEntities(_entityStruct storage Entities) internal 
    view returns (address[] memory) 
    {
        return Entities._activatedEntities;
    }

    function retrieveTotalEntities(_entityStruct storage Entities) internal 
    view returns (uint) 
    {
        return Entities._activatedEntities.length;
    }

    function retrieveUpdatedTimes(address entity, _entityStruct storage Entities) internal 
        isEntityActivated(true, Entities._entities[entity])
    view returns (uint) 
    {
        return Entities._entities[entity]._updatedTimes;
    }

    function isEntity(_entityIdentity memory Entity) internal pure returns (bool){
        return Entity._activated;
    }
}