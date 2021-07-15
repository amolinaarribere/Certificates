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
        return FindPosition(bytes32(uint256(uint160(add))), AddressArrayToBytes(list));
    }

    function FindUintPosition(uint value, uint[] memory list) public pure returns (uint){
        return FindPosition(bytes32(value), UintArrayToBytes(list));
    }

    function FindPosition(bytes32 data, bytes32[] memory list) internal pure returns (uint){
        for(uint i=0; i < list.length; i++){
            if(data == list[i]) return i;
        }

        return list.length + 1;
    }

    function AddressArrayRemoveResize(uint index, address[] memory array) internal 
        isIdCorrect(index, array.length)
    pure returns(address[] memory) 
    {
        return BytesArrayToAddress(ArrayRemoveResize(index, AddressArrayToBytes(array)));
    }

    function UintArrayRemoveResize(uint index, uint[] memory array) public 
        isIdCorrect(index, array.length)
    pure returns(uint[] memory) 
    {
        return BytesArrayToUint(ArrayRemoveResize(index, UintArrayToBytes(array)));
    }

    function ArrayRemoveResize(uint index, bytes32[] memory array) public 
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

    function UintArrayToBytes(uint[] memory array) internal pure returns(bytes32[] memory){
        bytes32[] memory arrayInBytes = new bytes32[](array.length);

        for(uint i=0; i < arrayInBytes.length; i++){
            arrayInBytes[i] = bytes32(array[i]);
        }

        return arrayInBytes;
    }

    function AddressArrayToBytes(address[] memory array) internal pure returns(bytes32[] memory){
        bytes32[] memory arrayInBytes = new bytes32[](array.length);

        for(uint i=0; i < arrayInBytes.length; i++){
            arrayInBytes[i] = bytes32(uint256(uint160(array[i])));
        }

        return arrayInBytes;
    }

    function BytesArrayToUint(bytes32[] memory array) internal pure returns(uint[] memory){
        uint[] memory arrayInUint = new uint[](array.length);

        for(uint i=0; i < arrayInUint.length; i++){
            arrayInUint[i] = uint256(array[i]);
        }

        return arrayInUint;
    }

    function BytesArrayToAddress(bytes32[] memory array) internal pure returns(address[] memory){
        address[] memory arrayInAddress = new address[](array.length);

        for(uint i=0; i < arrayInAddress.length; i++){
            arrayInAddress[i] = address(uint160(uint256(array[i])));
        }

        return arrayInAddress;
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
            Entities._pendingEntitiesAdd = AddressArrayRemoveResize(FindAddressPosition(entity, Entities._pendingEntitiesAdd), Entities._pendingEntitiesAdd);
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
            Entities._activatedEntities = AddressArrayRemoveResize(FindAddressPosition(entity, Entities._activatedEntities), Entities._activatedEntities);
            Entities._pendingEntitiesRemove = AddressArrayRemoveResize(FindAddressPosition(entity, Entities._pendingEntitiesRemove), Entities._pendingEntitiesRemove);
            delete(Entities._entities[entity]);
        }  
       
    }

    function retrieveEntity(address entity, _entityStruct storage Entities) internal 
    view returns (string memory, bool) 
    {
        return (Entities._entities[entity]._Info, isEntity(Entities._entities[entity]));
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
            (_Entities_Info[i],) = retrieveEntity(_Entities[i], Entities);
        }
        
        return(_Entities, _Entities_Info);
    }

    function isEntity(_entityIdentity memory Entity) internal pure returns (bool){
        return Entity._activated;
    }
}