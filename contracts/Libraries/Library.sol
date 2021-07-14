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

    struct _NoncesPerAddressStruct{
        mapping(address => uint) _highestNoncePerAddress;
        mapping(address => mapping(uint => bool)) _noncesPerAddress;
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
        require(true == IdCorrect(Id, length), "EC1");
        _;
    }

    modifier isNonceOK(uint nonce, _NoncesPerAddressStruct storage Nonces){
        isNonceNew(nonce, Nonces);
        _;
    }

    // auxiliary functions
    function isNonceNew(uint nonce, _NoncesPerAddressStruct storage Nonces) public view{
        require(false == Nonces._noncesPerAddress[msg.sender][nonce], "EC20");
    }

    function NotAlreadyVoted(Actions action, _entityIdentity memory Entity) public view{
        if(Actions.Add == action) require(false == FindAddress(msg.sender, Entity._AddValidated), "EC5");
        else require(false == FindAddress(msg.sender, Entity._RemoveValidated), "EC5");
    }
    
    function EntityActivated(bool YesOrNo, _entityIdentity memory Entity) public pure{
        if(false == YesOrNo) require(false == isEntity(Entity), "EC6");
        else require(true == isEntity(Entity), "EC7");
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

    function ArrayRemoveResize(uint index, bytes32[] memory array) internal 
        isIdCorrect(index, array.length)
    pure returns(bytes32[] memory) 
    {
        bytes32[] memory newArray = new bytes32[](array.length - 1);
        array[index] = array[array.length - 1];
        
        for(uint i=0; i < newArray.length; i++){
            newArray[i] = array[i];
        }
        
        return newArray;
    }

    function Bytes32ToAddress(bytes32 data) internal pure returns (address) {
        return address(uint160(uint256(data)));
    }

    function AddressToBytes32(address addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }

    function ArrayBytes32ToAddress(bytes32[] memory data) internal pure returns (address[] memory) {
        address[] memory returnedAddr = new address[](data.length);
        for(uint i=0; i < data.length; i++){
            returnedAddr[i] = Bytes32ToAddress(data[i]);
        }
        return returnedAddr;
    }

    function ArrayAddressToBytes32(address[] memory addr) internal pure returns (bytes32[] memory) {
        bytes32[] memory returnedBytes = new bytes32[](addr.length);
        for(uint i=0; i < addr.length; i++){
            returnedBytes[i] = AddressToBytes32(addr[i]);
        }
        return returnedBytes;
    }

    function CheckValidations(uint256 signatures, uint256 minSignatures) internal pure returns(bool){
        if(signatures < minSignatures) return false;
        return true;
    }

    function AddNonce(uint nonce, _NoncesPerAddressStruct storage Nonces) public {
        Nonces._noncesPerAddress[msg.sender][nonce] = true;
        if(Nonces._highestNoncePerAddress[msg.sender] < nonce) Nonces._highestNoncePerAddress[msg.sender] = nonce;
    }

    // functions for entities
    function addEntity(address entity, string memory entityInfo, _entityStruct storage Entities, uint256 minSignatures, _NoncesPerAddressStruct storage Nonces, uint nonce) internal 
        isEntityActivated(false, Entities._entities[entity]) 
        HasNotAlreadyVoted(Actions.Add, Entities._entities[entity])
        isNonceOK(nonce, Nonces)
    {
        if(0 == Entities._entities[entity]._AddValidated.length){
            Entities._entities[entity]._Info = entityInfo;
            Entities._pendingEntitiesAdd.push(entity);
        } 

        Entities._entities[entity]._AddValidated.push(msg.sender);
        AddNonce(nonce, Nonces);

        if(CheckValidations(Entities._entities[entity]._AddValidated.length, minSignatures)){
            Entities._entities[entity]._activated = true; 
            Entities._activatedEntities.push(entity);
            Entities._pendingEntitiesAdd = ArrayBytes32ToAddress(ArrayRemoveResize(FindAddressPosition(entity, Entities._pendingEntitiesAdd), ArrayAddressToBytes32(Entities._pendingEntitiesAdd)));
        }
    }

    function removeEntity(address entity, _entityStruct storage Entities, uint256 minSignatures, _NoncesPerAddressStruct storage Nonces, uint nonce) internal 
        isEntityActivated(true, Entities._entities[entity])
        HasNotAlreadyVoted(Actions.Remove, Entities._entities[entity])
        isNonceOK(nonce, Nonces)
    {
        if(0 == Entities._entities[entity]._RemoveValidated.length){
            Entities._pendingEntitiesRemove.push(entity);
        } 

        Entities._entities[entity]._RemoveValidated.push(msg.sender);
        AddNonce(nonce, Nonces);

        if(msg.sender == entity || CheckValidations(Entities._entities[entity]._RemoveValidated.length, minSignatures)){
            Entities._activatedEntities = ArrayBytes32ToAddress(ArrayRemoveResize(FindAddressPosition(entity, Entities._activatedEntities), ArrayAddressToBytes32(Entities._activatedEntities)));
            Entities._pendingEntitiesRemove = ArrayBytes32ToAddress(ArrayRemoveResize(FindAddressPosition(entity, Entities._pendingEntitiesRemove), ArrayAddressToBytes32(Entities._pendingEntitiesRemove)));
            delete(Entities._entities[entity]);
        }  
       
    }

    function retrieveEntity(address entity, _entityStruct storage Entities) internal 
        isEntityActivated(true, Entities._entities[entity])
    view returns (string memory) 
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

    function retrievePendingEntities(_entityStruct storage Entities, bool addOrRemove) internal 
    view returns (address[] memory, string[] memory) 
    {
        address[] memory _Entities;

        if(addOrRemove) _Entities = Entities._pendingEntitiesAdd;
        else _Entities = Entities._pendingEntitiesRemove;

        string[] memory _Entities_Info = new string[](_Entities.length);

        for(uint i=0; i < _Entities.length; i++){
            _Entities_Info[i] = retrieveEntity(_Entities[i], Entities);
        }
        
        return(_Entities, _Entities_Info);
    }

    function isEntity(_entityIdentity memory Entity) internal pure returns (bool){
        return Entity._activated;
    }
}