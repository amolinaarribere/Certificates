// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Interfaces/IMultiSigContract.sol";
 import "../Base/EntitiesBaseContract.sol";
 import "../Libraries/AddressLibrary.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract MultiSigContract is IMultiSigContract, EntitiesBaseContract, Initializable{
    using AddressLibrary for *;

    // MODIFIERS /////////////////////////////////////////
    modifier NotEmpty(bytes32 document){
        require(0 < document.length, "EC11");
        _;
    }
    
    modifier minRequired(uint min, uint number){
        require(min <= number, "EC19");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function MultiSigContract_init(address[] memory owners,  uint256 minOwners, uint256 TotalEntities, string[] memory labels, uint256 ownerId) public initializer 
        minRequired(minOwners, owners.length)
    {
        require(minOwners > 0, "EC17");
        require(TotalEntities == labels.length, "EC18");

        _ownerId = ownerId;

        for(uint j=0; j < TotalEntities; j++){
            _Entities.push();
            _entitiesLabel.push(labels[j]);
        }

        _minOwners = minOwners;
        for (uint i=0; i < owners.length; i++) {
            bytes32 ownerInBytes = AddressLibrary.AddressToBytes32(owners[i]);
            _Entities[_ownerId]._items[ownerInBytes]._activated = true;
            _Entities[_ownerId]._activatedItems.push(ownerInBytes); 
        } 
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function addOwner(address owner, string calldata ownerInfo) external override 
    {
        addEntity(owner, ownerInfo, _ownerId);
    }
    
    function removeOwner(address owner) external override
        minRequired(_minOwners, retrieveAllEntities(_ownerId).length - 1)
    {
        removeEntity(owner, _ownerId);
    }

    function validateOwner(address owner) external override
    {
        if(true == isEntityPendingToRemoved(owner, _ownerId)){
            require(_minOwners <= retrieveAllEntities(_ownerId).length - 1, "EC19");
        }
        validateEntity(owner, _ownerId);
    }

    function rejectOwner(address owner) external override
    {
        rejectEntity(owner, _ownerId);
    }
    
    function retrieveOwner(address owner) external override view returns (string memory, bool){
        return (retrieveEntity(owner, _ownerId));
    }

    function retrieveAllOwners() external override view returns (address[] memory){
        return(retrieveAllEntities(_ownerId));
    }

    function retrieveMinOwners() external override view returns (uint){
        return (_minOwners);
    }

    function isOwner(address owner) internal view returns (bool){
        return(isEntity(owner, _ownerId));
    }

    function retrievePendingOwners(bool addedORremove) external override view returns (address[] memory, string[] memory){
        return(retrievePendingEntities(addedORremove, _ownerId));
    }

}