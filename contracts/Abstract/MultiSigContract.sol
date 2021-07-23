// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Interfaces/IMultiSigContract.sol";
 import "../Base/EntitiesBaseContract.sol";

abstract contract MultiSigContract is IMultiSigContract, EntitiesBaseContract{

    // modifier
     modifier isSomeoneSpecific(address someone){
        require(true == Library.ItIsSomeone(someone), "EC8");
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

    // OWNERS CRUD Operations
    function addOwner(address owner, string memory ownerInfo) external override {
        addEntity(owner, ownerInfo, _ownerId);
    }
    
    function removeOwner(address owner) external override
        minRequired(_minOwners, retrieveAllEntities(_ownerId).length - 1)
    {
        removeEntity(owner, _ownerId);
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

    function isOwner(address owner) public view returns (bool){
        return(isEntity(owner, _ownerId));
    }

    function retrievePendingOwners(bool addedORremove) external override view returns (address[] memory, string[] memory){
        return(retrievePendingEntities(addedORremove, _ownerId));
    }

}