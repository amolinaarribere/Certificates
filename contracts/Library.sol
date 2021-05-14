// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

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
        uint256 _id;
        bool _activated;
        string _Info;
        uint256 _updatedTimes;
        address[] _AddValidated;
        address[] _RemoveValidated;
        address[] _UpdateValidated;
    }

    struct _entityStruct{
        mapping(address => _entityIdentity) _entities;
        address[] _activatedEntities;
    }

    struct _Certificate{
        address _Provider;
        bytes _CertificateHash;
    }

    // modifier
    modifier HasNotAlreadyVoted(Actions action, address entity, _entityStruct storage Entities){
        string memory message = "Owner has already voted";
        if(Actions.Update == action) require(false == FindAddress(msg.sender, Entities._entities[entity]._UpdateValidated), message);
        else if(Actions.Add == action) require(false == FindAddress(msg.sender, Entities._entities[entity]._AddValidated), message);
        else require(false == FindAddress(msg.sender, Entities._entities[entity]._RemoveValidated), message);
        _;
    }

    modifier isEntityActivated(bool YesOrNo, address entity, _entityStruct storage Entities){
        if(false == YesOrNo) require(false == isEntity(entity, Entities), "Entity already activated");
        else require(true == isEntity(entity, Entities), "Entity must be activated");
        _;
    }

    // auxiliary functions
    function IdCorrect(uint Id, uint length) public pure returns (bool){
        return (length > Id);
    }

    function FindAddress(address add, address[] memory list) internal pure returns (bool){
        for(uint i=0; i < list.length; i++){
            if(add == list[i]) return true;
        }

        return false;
    }

    function CountActiveItems(address[] memory list) internal pure returns (uint){
        uint total = 0;
        for(uint i=0; i < list.length; i++){
            if(address(0) != list[i]){
                total += 1;
            }
        }
        return total;
    }

    function CheckValidations(uint256 signatures, uint256 minSignatures) internal pure returns(bool){
        if(signatures < minSignatures) return false;
        return true;
    }

    // functions for entities
    function addEntity(address entity, string memory entityInfo, _entityStruct storage Entities, uint256 minSignatures) internal 
        isEntityActivated(false, entity, Entities) 
        HasNotAlreadyVoted(Actions.Add, entity, Entities)
    {
        if(0 == Entities._entities[entity]._AddValidated.length) Entities._entities[entity]._Info = entityInfo;

        Entities._entities[entity]._AddValidated.push(msg.sender);

        if(CheckValidations(Entities._entities[entity]._AddValidated.length, minSignatures)){
            Entities._entities[entity]._activated = true;
            Entities._entities[entity]._id = Entities._activatedEntities.length;
            Entities._activatedEntities.push(entity);
        }
    }

    function removeEntity(address entity, _entityStruct storage Entities, uint256 minSignatures) internal 
        isEntityActivated(true, entity, Entities)
        HasNotAlreadyVoted(Actions.Remove, entity, Entities)
    {
        Entities._entities[entity]._RemoveValidated.push(msg.sender);

        if(msg.sender == entity || CheckValidations(Entities._entities[entity]._RemoveValidated.length, minSignatures)){
            delete(Entities._activatedEntities[Entities._entities[entity]._id]);
            delete(Entities._entities[entity]);
        }  
       
    }

    function updateEntity(address entity, string memory entityInfo, _entityStruct storage Entities, uint256 minSignatures) internal 
        isEntityActivated(true, entity, Entities)
        HasNotAlreadyVoted(Actions.Update, entity, Entities)
    {   
        Entities._entities[entity]._UpdateValidated.push(msg.sender); 

        if(CheckValidations(Entities._entities[entity]._UpdateValidated.length, minSignatures)){
            Entities._entities[entity]._Info = entityInfo;
            Entities._entities[entity]._updatedTimes += 1;
            delete(Entities._entities[entity]._UpdateValidated);
        }       
    }

    function retrieveEntity(address entity, _entityStruct storage Entities) internal 
        isEntityActivated(true, entity, Entities)
    view returns (string memory) 
    {
        return Entities._entities[entity]._Info;
    }

    function retrieveAllEntities(_entityStruct storage Entities) internal 
    view returns (address[] memory) 
    {
        uint TotalEntities = retrieveTotalEntities(Entities);
        address[] memory activatedEntities = new address[](TotalEntities);
        uint counter;

        for(uint i=0; i < Entities._activatedEntities.length; i++){
            if(address(0) != Entities._activatedEntities[i]){
                activatedEntities[counter] = Entities._activatedEntities[i];
                counter += 1;
            }
        }

        return(activatedEntities);
    }

    function retrieveTotalEntities(_entityStruct storage Entities) internal 
    view returns (uint) 
    {
        return(CountActiveItems(Entities._activatedEntities));
    }

    function retrieveUpdatedTimes(address entity, _entityStruct storage Entities) internal 
        isEntityActivated(true, entity, Entities)
    view returns (uint) 
    {
        return Entities._entities[entity]._updatedTimes;
    }

    function isEntity(address entity, _entityStruct storage Entities) internal view returns (bool){
        return(Entities._entities[entity]._activated);
    }
}