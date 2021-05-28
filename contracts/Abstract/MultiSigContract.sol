// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Libraries/Library.sol";

abstract contract MultiSigContract {
    using Library for *;

    //events
    event _AddEntityValidationIdEvent(string, address);
    event _RemoveEntityValidationIdEvent(string, address);

    // owners
    uint _ownerId;
    uint256 _minOwners;

    // Total Owners and other Entities
    string[] _entitiesLabel;
    Library._entityStruct[] _Entities;

    // modifiers
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "EC1");
        _;
    }

    modifier isSomeoneSpecific(address someone){
        require(msg.sender == someone, "EC8");
        _;
    }

    modifier isAnOwner(){
        require(true == isOwner(msg.sender), "EC9");
        _;
    }

    modifier isAnOwnerOrHimself(address entity){
        require(true == isOwner(msg.sender) || msg.sender == entity, "EC10");
        _;
    }

    modifier NotEmpty(bytes32 document){
        require(0 < document.length, "EC11");
        _;
    }
    
    modifier minRequired(uint min, uint number){
        require(min <= number, "EC19");
        _;
    }

    // Constructor
    constructor(address[] memory owners,  uint256 minOwners, uint256 TotalEntities, string[] memory labels, uint256 ownerId) payable{
        require(minOwners <= owners.length, "EC16");
        require(minOwners > 0, "EC17");
        require(TotalEntities == labels.length, "EC18");

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

    function addEntity(address entity, bytes memory entityInfo, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner 
    {
        Library.addEntity(entity, entityInfo, _Entities[listId], _minOwners);

        if(true == Library.isEntity(_Entities[listId]._entities[entity])){
            emit _AddEntityValidationIdEvent(_entitiesLabel[listId], entity);
        }
    }

    function removeEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwnerOrHimself(entity) 
    {
        Library.removeEntity(entity, _Entities[listId], _minOwners);

        if(false == Library.isEntity(_Entities[listId]._entities[entity])){
            emit _RemoveEntityValidationIdEvent(_entitiesLabel[listId], entity);
        }
       
    }

    function retrieveEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (bytes memory) 
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
    view returns (uint)
    {
        return (Library.retrieveTotalEntities(_Entities[listId]));
    }

    function isEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _Entities.length)
    view returns (bool){
        return(Library.isEntity(_Entities[listId]._entities[entity]));
    }

    // OWNERS CRUD Operations
    function addOwner(address owner, string memory ownerInfo) external {
        addEntity(owner, bytes(ownerInfo), _ownerId);
    }
    
    function removeOwner(address owner) external
        minRequired(_minOwners, retrieveTotalOwners() - 1)
    {
        removeEntity(owner, _ownerId);
    }
    
    function retrieveOwner(address owner) external view returns (string memory){
        return string(retrieveEntity(owner, _ownerId));
    }

    function retrieveAllOwners() external view returns (address[] memory){
        return(retrieveAllEntities(_ownerId));
    }

    function retrieveTotalOwners() public view returns (uint){
        return (retrieveTotalEntities(_ownerId));
    }

    function isOwner(address owner) public view returns (bool){
        return(isEntity(owner, _ownerId));
    }

}