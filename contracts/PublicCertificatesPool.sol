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

 contract PublicCertificatesPool is MultiSigCertificatesPool, ManagedBaseContract {
    using Library for *;

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
        _Entities[_providerId]._entities[provider]._Info = providerInfo;
        _Entities[_providerId]._pendingEntitiesAdd.push(provider);

        emit _SendProposalId(provider, providerInfo);
    }

    function onEntityValidated(address entity, uint listId, bool addOrRemove) internal override
    {
        if(addOrRemove)payBack( entity, listId, true);
    }

    function onEntityRejected(address entity, uint listId, bool addOrRemove) internal override
    {
        if(addOrRemove)payBack( entity, listId, false);
    }

    function payBack(address entity, uint listId, bool validatedOrRejected) internal
    {
        if(listId == _providerId){
            if(true == isProvider(entity)){
                address[] memory Voters = (validatedOrRejected) ? _Entities[_providerId]._entities[entity]._Validations : _Entities[_providerId]._entities[entity]._Rejections;

                for(uint i=0; i < Voters.length; i++){
                    _Treasury.getRefund(Voters[i], Voters.length);
                }
            }
        }
    }

    function addCertificate(bytes32 CertificateHash, address holder) external override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewCertificate);
        addCertificateInternal(CertificateHash, holder);
    }

 }