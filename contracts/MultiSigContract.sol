// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Library.sol";

abstract contract MultiSigContract {
    using Library for *;

    //events
    event _AddEntityValidationIdEvent(string, address);
    event _RemoveEntityValidationIdEvent(string, address);
    event _UpdateEntityValidationIdEvent(string, address);

    // owners
    uint _ownerId;
    uint256 _minOwners;

    // Total Owners and other Entities
    string[] _entitiesLabel;
    Library._entityStruct[] _Entities;

    // modifiers
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "provided Id is wrong");
        _;
    }

    modifier isSomeoneSpecific(address someone){
        require(msg.sender == someone, "It is who it should be");
        _;
    }

    modifier isAnOwner(){
        require(true == isOwner(msg.sender), "Only Owners are allowed to perform this action");
        _;
    }

    modifier isAnOwnerOrHimself(address entity){
        require(true == isOwner(msg.sender) || msg.sender == entity, "Not allowed to remove entity");
        _;
    }

    modifier NotEmpty(bytes memory document){
        require(0 < document.length, "Empty");
        _;
    }

    // Constructor
    constructor(address[] memory owners,  uint256 minOwners, uint256 TotalEntities, string[] memory labels, uint256 ownerId) payable{
        require(minOwners <= owners.length, "Not enough owners provided to meet the minOwners requirement");
        require(minOwners > 0, "At least 1 minimum owner");
        require(TotalEntities == labels.length, "Not enough or too many labels");

        _ownerId = ownerId;

        for(uint j=0; j < TotalEntities; j++){
            _Entities.push();
            _entitiesLabel.push(labels[j]);
        }

        _minOwners = minOwners;
        for (uint i=0; i < owners.length; i++) {
            _Entities[_ownerId]._entities[owners[i]]._activated = true;
            _Entities[_ownerId]._activatedEntities.push(owners[i]); 
        }
    }

    function addEntity(address entity, string memory entityInfo, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner 
    {
        Library.addEntity(entity, entityInfo, _Entities[listId], _minOwners);

        if(true == Library.isEntity(entity, _Entities[listId])){
            emit _AddEntityValidationIdEvent(_entitiesLabel[listId], entity);
        }
    }

    function removeEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwnerOrHimself(entity) 
    {
        Library.removeEntity(entity, _Entities[listId], _minOwners);

        if(false == Library.isEntity(entity, _Entities[listId])){
            emit _RemoveEntityValidationIdEvent(_entitiesLabel[listId], entity);
        }
       
    }

    function updateEntity(address entity, string memory newEntityInfo, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner
    {
        uint UpdatedTimes = Library.retrieveUpdatedTimes(entity, _Entities[listId]);
        Library.updateEntity(entity, newEntityInfo, _Entities[listId], _minOwners);

        if(Library.retrieveUpdatedTimes(entity, _Entities[listId]) == UpdatedTimes + 1){
            emit _UpdateEntityValidationIdEvent(_entitiesLabel[listId], entity);
        }
    }

    function retrieveEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (string memory) 
    {
        return Library.retrieveEntity(entity, _Entities[listId]);
    }

    function retrieveAllEntities(uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
    view returns (address[] memory) 
    {
        return (Library.retrieveAllEntities(_Entities[listId]));
    }

    function retrieveTotalEntities(uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (uint){
        return (Library.retrieveTotalEntities(_Entities[listId]));
    }

    function isEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (bool){
        return(Library.isEntity(entity, _Entities[listId]));
    }

    // OWNERS CRUD Operations
    function addOwner(address owner, string memory ownerInfo) external {
        addEntity(owner, ownerInfo, _ownerId);
    }
    
    function removeOwner(address owner) external {
        removeEntity(owner, _ownerId);
    }

    function updateOwner(address owner, string memory ownerInfo) external {
       updateEntity(owner, ownerInfo, _ownerId);
    }
    
    function retrieveOwner(address owner) external view returns (string memory){
        return retrieveEntity(owner, _ownerId);
    }

    function retrieveAllOwners() external view returns (address[] memory){
        return(retrieveAllEntities(_ownerId));
    }

    function retrieveTotalOwners() external view returns (uint){
        return (retrieveTotalEntities(_ownerId));
    }

    function isOwner(address owner) public view returns (bool){
        return(isEntity(owner, _ownerId));
    }

}