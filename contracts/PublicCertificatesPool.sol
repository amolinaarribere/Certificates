// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Abstract/MultiSigCertificatesPool.sol";
 import "./Treasury.sol";
 import "./Libraries/Library.sol";
 import "./Base/ManagedBaseContract.sol";
 import "./Libraries/AddressLibrary.sol";

 contract PublicCertificatesPool is MultiSigCertificatesPool, ManagedBaseContract {
    using Library for *;
    using AddressLibrary for *;

    // events
    event _SendProposalId(address indexed,  string indexed);

    // Treasury
    Treasury _Treasury;

    // Constructor
    constructor(address[] memory owners,  uint256 minOwners, address managerContractAddress)
    MultiSigCertificatesPool(owners, minOwners) 
    ManagedBaseContract(managerContractAddress) 
    {}

    // functionality
    function updateContracts(address TreasuryAddress) external
        isFromManagerContract()
    {
        _Treasury = Treasury(TreasuryAddress);
    }

    function addProvider(address provider, string memory providerInfo) external 
        isEntityActivated(false, provider, _providerId) 
        isEntityPendingToAdd(false, provider, _providerId)
    override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewProvider);
        bytes32 providerInBytes = AddressLibrary.AddressToBytes(provider);
        _Entities[_providerId]._items[providerInBytes]._Info = providerInfo;
        _Entities[_providerId]._pendingItemsAdd.push(providerInBytes);

        emit _SendProposalId(provider, providerInfo);
    }

    function onItemValidated(bytes32 item, uint id, bool addOrRemove) public 
    {
        if(addOrRemove)payBack(item, id, true);
    }

    function onItemRejected(bytes32 item, uint id, bool addOrRemove) public 
    {
        if(addOrRemove)payBack(item, id, false);
    }

    function payBack(bytes32 entityInBytes, uint listId, bool validatedOrRejected) internal
    {
        if(listId == _providerId){
            address[] memory Voters = (validatedOrRejected) ? _Entities[_providerId]._items[entityInBytes]._Validations : _Entities[_providerId]._items[entityInBytes]._Rejections;

            for(uint i=0; i < Voters.length; i++){
                _Treasury.getRefund(Voters[i], Voters.length);
            }
        }
    }

    function addCertificate(bytes32 CertificateHash, address holder) external override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewCertificate);
        addCertificateInternal(CertificateHash, holder);
    }

 }