// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Libraries/Library.sol";
 import "../Interfaces/IMultiSigContract.sol";

abstract contract MultiSigContract is IMultiSigContract{
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

    // Nonces
    Library._NoncesPerAddressStruct _Nonces;

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

    modifier isNonceOK(uint nonce){
        Library.isNonceNew(nonce, _Nonces);
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

    function addEntity(address entity, string memory entityInfo, uint listId, uint nonce) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwner 
    {
        Library.addEntity(entity, entityInfo, _Entities[listId], _minOwners, _Nonces, nonce);

        if(true == Library.isEntity(_Entities[listId]._entities[entity])){
            emit _AddEntityValidationIdEvent(_entitiesLabel[listId], entity);
        }
    }

    function removeEntity(address entity, uint listId, uint nonce) internal 
        isIdCorrect(listId, _Entities.length) 
        isAnOwnerOrHimself(entity) 
    {
        Library.removeEntity(entity, _Entities[listId], _minOwners, _Nonces, nonce);

        if(false == Library.isEntity(_Entities[listId]._entities[entity])){
            emit _RemoveEntityValidationIdEvent(_entitiesLabel[listId], entity);
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
    function addOwner(address owner, string memory ownerInfo, uint nonce) external override {
        addEntity(owner, ownerInfo, _ownerId, nonce);
    }
    
    function removeOwner(address owner, uint nonce) external override
        minRequired(_minOwners, retrieveTotalEntities(_ownerId) - 1)
    {
        removeEntity(owner, _ownerId, nonce);
    }
    
    function retrieveOwner(address owner) external override view returns (string memory){
        return string(retrieveEntity(owner, _ownerId));
    }

    function retrieveAllOwners() external override view returns (address[] memory){
        return(retrieveAllEntities(_ownerId));
    }

    function retrieveTotalOwners() external override view returns (uint){
        return (retrieveTotalEntities(_ownerId));
    }

    function retrieveMinOwners() external override view returns (uint){
        return (_minOwners);
    }

    function isOwner(address owner) public view returns (bool){
        return(isEntity(owner, _ownerId));
    }

    function retrieveHighestNonceForAddress(address addr) external override view returns (uint){
        return(_Nonces._highestNoncePerAddress[addr]);
    }

    function retrievePendingOwners(bool addedORremove) external override view returns (address[] memory, string[] memory){
        return(Library.retrievePendingEntities(_Entities[_ownerId],addedORremove));
    }

}