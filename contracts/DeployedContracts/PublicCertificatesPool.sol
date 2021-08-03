// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Abstract/MultiSigCertificatesPool.sol";
 import "./Treasury.sol";
 import "../Libraries/Library.sol";
 import "../Base/ManagedBaseContract.sol";
 import "../Libraries/AddressLibrary.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

 contract PublicCertificatesPool is Initializable, MultiSigCertificatesPool, ManagedBaseContract {
    using Library for *;
    using AddressLibrary for *;

    // EVENTS
    event _SendProposalId(address, address indexed,  string indexed);

    // DATA
    // Treasury
    //Treasury _Treasury;

    // CONSTRUCTOR
    /*constructor(address[] memory owners,  uint256 minOwners, address managerContractAddress)
    MultiSigCertificatesPool(owners, minOwners) 
    ManagedBaseContract(managerContractAddress) 
    {}*/

    function PublicCertPool_init(address[] memory owners,  uint256 minOwners, address managerContractAddress) public initializer {
        super.MultiSigCertPool_init(owners, minOwners); 
        super.ManagedBaseContract_init(managerContractAddress); 
    }

    // FUNCTIONALITY
    /*function updateContracts(address TreasuryAddressProxy) external
        isFromManagerContract()
    {
        _Treasury = Treasury(TreasuryAddressProxy);
    }*/

    function addProvider(address provider, string memory providerInfo) external 
        isEntityActivated(false, provider, _providerId) 
        isEntityPendingToAdd(false, provider, _providerId)
    override payable
    {
        Treasury(_managerContract.retrieveTreasuryProxy()).pay{value:msg.value}(Library.Prices.NewProvider);
        bytes32 providerInBytes = AddressLibrary.AddressToBytes(provider);
        _Entities[_providerId]._items[providerInBytes]._Info = providerInfo;
        _Entities[_providerId]._pendingItemsAdd.push(providerInBytes);

        emit _SendProposalId(address(this), provider, providerInfo);
    }

    function payBack(bytes32 entityInBytes, bool validatedOrRejected) internal
    {
        address[] memory Voters = (validatedOrRejected) ? _Entities[_providerId]._items[entityInBytes]._Validations : _Entities[_providerId]._items[entityInBytes]._Rejections;

        for(uint i=0; i < Voters.length; i++){
            Treasury(_managerContract.retrieveTreasuryProxy()).getRefund(Voters[i], Voters.length);
        }
    }

    function addCertificate(bytes32 CertificateHash, address holder) external override payable
    {
        Treasury(_managerContract.retrieveTreasuryProxy()).pay{value:msg.value}(Library.Prices.NewCertificate);
        addCertificateInternal(CertificateHash, holder);
    }

    // Callback functions

    function onItemValidated(bytes32 item, uint256[] calldata ids, bool addOrRemove) public override 
    {
        super.onItemValidated(item, ids, addOrRemove);

        if(ids[0] == _providerId){
            if(addOrRemove)payBack(item, true);
        }
    }

    function onItemRejected(bytes32 item, uint256[] calldata ids, bool addOrRemove) public override  
    {
        super.onItemRejected(item, ids, addOrRemove);

        if(ids[0] == _providerId){
            if(addOrRemove)payBack(item, false);
        }
    }

 }