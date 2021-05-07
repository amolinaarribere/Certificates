// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

abstract contract MultiSigContract {

    //events
    event _AddEntityValidationIdEvent(string, address);
    event _RemoveEntityValidationIdEvent(string, address);

    //Structures
    struct _entityIdentity{
        uint256 _id;
        bool _activated;
        string _Info;
        uint256 _addValidations;
        mapping(address => bool) _AddValidated;
        uint256 _removeValidations;
        mapping(address => bool) _RemoveValidated;
    }

    struct _entityStruct{
        mapping(address => _entityIdentity) _entities;
        address[] _activatedEntities;
    }

    // owners
    uint _ownerId;
    uint256 _minOwners;

    // Total Owners and other Entities
    uint256[] _numberOfEntities;
    string[] _entitiesLabel;
    _entityStruct[] _certificateEntities;

    //Actions that can be performed on entities
    enum Actions{
        Add,
        Remove
    }

    // modifiers
    modifier isIdCorrect(uint Id, uint length){
        require(length > Id, "provided Id is wrong");
        _;
    }

    modifier isEntityActivated(bool YesOrNo, address entity, uint listId){
        if(false == YesOrNo) require(false == isEntity(entity, listId), string(abi.encodePacked(_entitiesLabel[listId]," already activated")));
        else require(true == isEntity(entity, listId), string(abi.encodePacked(_entitiesLabel[listId]," must be activated")));
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

    modifier OwnerhasNotAlreadyVoted(Actions action, address entity){
        string memory message = "Owner has already voted";
        if(Actions.Remove == action) require(false == _certificateEntities[_ownerId]._entities[entity]._RemoveValidated[msg.sender], message);
        else require(false == _certificateEntities[_ownerId]._entities[entity]._AddValidated[msg.sender], message);
        _;
    }

    // Constructor
    constructor(address[] memory owners,  uint256 minOwners, uint256 TotalEntities, string[] memory labels, uint256 ownerId) payable{
        require(minOwners <= owners.length, "Not enough owners provided to meet the minOwners requirement");
        require(minOwners > 0, "At least 1 minimum owner");
        require(TotalEntities == labels.length, "Not enough or too many labels");

        _ownerId = ownerId;

        for(uint j=0; j < TotalEntities; j++){
            _certificateEntities.push();
            _numberOfEntities.push();
            _entitiesLabel.push(labels[j]);
        }

        _minOwners = minOwners;
        for (uint i=0; i < owners.length; i++) {
            _certificateEntities[_ownerId]._entities[owners[i]]._activated = true;
            _certificateEntities[_ownerId]._activatedEntities.push(owners[i]);
            _numberOfEntities[_ownerId] += 1;  
        }
    }

    // Generic Entity CRUD Operation
    function CheckValidations(uint256 fieldToValidate) internal view returns(bool){
        if(fieldToValidate < _minOwners) return false;
        return true;
    }

    function addEntity(address entity, string memory entityInfo, uint listId) internal 
        isIdCorrect(listId, _numberOfEntities.length) 
        isAnOwner 
        isEntityActivated(false, entity, listId) 
        OwnerhasNotAlreadyVoted(Actions.Add, entity)
    {
        if(0 == _certificateEntities[listId]._entities[entity]._addValidations) _certificateEntities[listId]._entities[entity]._Info = entityInfo;
        _certificateEntities[listId]._entities[entity]._addValidations += 1;
        _certificateEntities[listId]._entities[entity]._AddValidated[msg.sender] = true;
        if(CheckValidations(_certificateEntities[listId]._entities[entity]._addValidations)){
            _certificateEntities[listId]._entities[entity]._activated = true;
            _certificateEntities[listId]._entities[entity]._id = _certificateEntities[listId]._activatedEntities.length;
            _certificateEntities[listId]._activatedEntities.push(entity);
            _numberOfEntities[listId] += 1;

            emit _AddEntityValidationIdEvent(_entitiesLabel[listId] ,entity);
        }
    }

    function removeEntity(address entity, uint listId) internal 
        isIdCorrect(listId, _numberOfEntities.length) 
        isAnOwnerOrHimself(entity) 
        isEntityActivated(true, entity, listId) 
        OwnerhasNotAlreadyVoted(Actions.Remove, entity)
    {

        _certificateEntities[listId]._entities[entity]._removeValidations += 1;
        _certificateEntities[listId]._entities[entity]._RemoveValidated[msg.sender] = true;
        if(msg.sender == entity || CheckValidations(_certificateEntities[listId]._entities[entity]._removeValidations)){
            delete(_certificateEntities[listId]._activatedEntities[_certificateEntities[listId]._entities[entity]._id]);
            delete(_certificateEntities[listId]._entities[entity]);
            _numberOfEntities[listId] -= 1;

            emit _RemoveEntityValidationIdEvent(_entitiesLabel[listId] ,entity);
        }  
       
    }

    function updateEntity(address entity, string memory entityInfo, uint listId) internal 
        isSomeoneSpecific(entity)
        isEntityActivated(true, entity, listId)
    {
       _certificateEntities[listId]._entities[entity]._Info = entityInfo;
    }

    function retrieveEntity(address entity, uint listId) internal 
        isEntityActivated(true, entity, listId) 
    view returns (string memory) 
    {
        return _certificateEntities[listId]._entities[entity]._Info;
    }

    function retrieveAllEntities(uint listId) internal 
        isIdCorrect(listId, _numberOfEntities.length) 
    view returns (address[] memory) 
    {
        address[] memory activatedEntities = new address[](_numberOfEntities[listId]);
        uint counter;

        for(uint i=0; i < _certificateEntities[listId]._activatedEntities.length; i++){
            if(address(0) != _certificateEntities[listId]._activatedEntities[i]){
                activatedEntities[counter] = _certificateEntities[listId]._activatedEntities[i];
                counter += 1;
            }
        }

        return(activatedEntities);
    }

    function retrieveTotalEntities(uint listId) internal view returns (uint){
        return (_numberOfEntities[listId]);
    }

    function isEntity(address entity, uint listId) internal view returns (bool){
        return(_certificateEntities[listId]._entities[entity]._activated);
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