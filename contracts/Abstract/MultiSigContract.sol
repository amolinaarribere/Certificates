// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  MultiSig Contract.
    Inherits from EntitesBaseCOntract and simply defines CRUD operations for Owners with spepcific security checks
 */

 import "../Interfaces/IMultiSigContract.sol";
 import "../Base/EntitiesBaseContract.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract MultiSigContract is IMultiSigContract, EntitiesBaseContract, Initializable{

    // DATA /////////////////////////////////////////
    // proposal for new min owners
    uint256 internal _newMinOwners;
    uint256 internal _newMinOwnersVotesFor;
    uint256 internal _newMinOwnersVotesAgainst;
    address[] internal _newMinOwnersVoters;

    // MODIFIERS /////////////////////////////////////////
    modifier NotEmpty(bytes32 document){
        require(0 < document.length, "EC11-");
        _;
    }
    
    modifier minRequired(uint min, uint number){
         minRequiredFunc(min, number);
        _;
    }

    function minRequiredFunc(uint min, uint number) internal pure{
        require(min <= number, "EC19-");
    }

    modifier HasNotAlreadyVotedMinOwner(address voter){
        HasNotAlreadyVotedMinOwnerFunc(voter);
       _;
    }

    function HasNotAlreadyVotedMinOwnerFunc(address voter) internal view {
        require(false == AddressLibrary.FindAddress(voter, _newMinOwnersVoters), "EC5-");
    }
    
    modifier NewMinOwnerInProgress(bool YesOrNo){
        NewMinOwnerInProgressFunc(YesOrNo);
        _;
    }

    function NewMinOwnerInProgressFunc(bool YesOrNo) internal view{
        if(YesOrNo) require(0 != _newMinOwners, "EC31-");
        else require(0 == _newMinOwners, "EC30-");
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function MultiSigContract_init(address[] memory owners,  uint256 minOwners, uint256 TotalEntities, string[] memory labels, uint256 ownerId) public initializer 
        minRequired(minOwners, owners.length)
        minRequired(1, minOwners)
    {
        require(TotalEntities == labels.length, "EC18-");

        _ownerId = ownerId;

        for(uint j=0; j < TotalEntities; j++){
            _Entities.push();
            _entitiesLabel.push(labels[j]);
        }

        _minOwners = minOwners;
        for (uint i=0; i < owners.length; i++) {
            bytes32 ownerInBytes = AddressLibrary.AddressToBytes32(owners[i]);
            require(false == _Entities[_ownerId]._items[ownerInBytes]._activated, "EC29-");
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
            require(_minOwners <= retrieveAllEntities(_ownerId).length - 1, "EC19-");
        }
        validateEntity(owner, _ownerId);
    }

    function rejectOwner(address owner) external override
    {
        rejectEntity(owner, _ownerId);
    }
    
    function retrieveOwner(address owner) external override view returns (ItemsLibrary._itemIdentity memory){
        return (retrieveEntity(owner, _ownerId));
    }

    function retrieveAllOwners() external override view returns (bytes32[] memory){
        return(retrieveAllEntities(_ownerId));
    }

    function retrieveMinOwners() external override view returns (uint){
        return (_minOwners);
    }

    function isOwner(address owner) internal view returns (bool){
        return(isEntity(owner, _ownerId));
    }

    function retrievePendingOwners(bool addedORremove) external override view returns (bytes32[] memory){
        return(retrievePendingEntities(addedORremove, _ownerId));
    }

    // New min Owners proposal
    function changeMinOwners(uint newMinOwners) external override
        isAnOwner(msg.sender)
        NewMinOwnerInProgress(false)
        minRequired(newMinOwners, _Entities[_ownerId]._activatedItems.length)
        minRequired(1, newMinOwners)
    {
        _newMinOwners = newMinOwners;
        voteNewMinOwners(true);
    }

    function validateMinOwners() external override
        isAnOwner(msg.sender)
        NewMinOwnerInProgress(true)
        HasNotAlreadyVotedMinOwner(msg.sender)
    {
        voteNewMinOwners(true);
    }
    
    function rejectMinOwners() external override
        isAnOwner(msg.sender)
        NewMinOwnerInProgress(true)
        HasNotAlreadyVotedMinOwner(msg.sender)
    {
        voteNewMinOwners(false);
    }

    function deleteNewMinOwners() internal 
    {
        _newMinOwners = 0;
        _newMinOwnersVotesFor = 0;
        _newMinOwnersVotesAgainst = 0;
        delete(_newMinOwnersVoters);
    }

    function voteNewMinOwners(bool vote) internal 
    {
        if(vote) _newMinOwnersVotesFor += 1;
        else _newMinOwnersVotesAgainst += 1;

        _newMinOwnersVoters.push(msg.sender);

        checkNewMinOwners();        
    }

    function checkNewMinOwners() internal
    {
        if(ItemsLibrary.CheckValidations(_newMinOwnersVotesFor, _minOwners))
        {
            _minOwners = _newMinOwners;
            deleteNewMinOwners();
        }
        else if(ItemsLibrary.CheckValidations(_newMinOwnersVotesAgainst, _minOwners))
        {
            deleteNewMinOwners();
        }

    }

    function retrievePendingMinOwners() external override view returns (uint)
    {
        return _newMinOwners;
    }

    function retrievePendingMinOwnersStatus() external override view returns (uint, uint, address[] memory)
    {
        return (_newMinOwnersVotesFor, _newMinOwnersVotesAgainst, _newMinOwnersVoters);
    }

}