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
    event _SendProposalId(address);

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
        isEntityPending(false, provider, _providerId, true)
    override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewProvider);
        _Entities[_providerId]._entities[provider]._Info = providerInfo;
        _Entities[_providerId]._pendingEntitiesAdd.push(provider);

        emit _SendProposalId(provider);
    }

    function validateProvider(address provider, bool addedORremove) external override
    {
        validateEntity(provider, _providerId, addedORremove);
    }

    function onEntityAdded(address entity, uint listId) internal override
    {
        if(listId == _providerId){
            if(true == isProvider(entity)){
                uint totalValidators = _Entities[_providerId]._entities[entity]._AddValidated.length;

                for(uint i=0; i < totalValidators; i++){
                    _Treasury.getRefund(_Entities[_providerId]._entities[entity]._AddValidated[i], totalValidators);
                }
            }
        }
    }

    function onEntityRemoved(address entity, uint listId) internal override{}

    function addCertificate(bytes32 CertificateHash, address holder) external override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewCertificate);
        addCertificateInternal(CertificateHash, holder);
    }

 }