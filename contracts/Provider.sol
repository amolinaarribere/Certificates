// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 import "./Libraries/Library.sol";
 import "./Interfaces/IProvider.sol";
 import "./Abstract/MultiSigContract.sol";
 import "./PrivateCertificatesPool.sol";
 import "./PublicCertificatesPool.sol";


 contract Provider is IProvider, MultiSigContract {
    using Library for *;

    uint256 constant TotalEntities = 2;

    // Owners
    uint256 constant _ownerIdProviders = 0;
    string constant _ownerLabel = "Owner";

    // Pools
    uint256 constant _poolId = 1;
    string constant _poolLabel = "Pool";

    string[] _Label = [_ownerLabel, _poolLabel];
    
    struct _CertificateStruct{
        mapping(bytes32 => _entityIdentity) _cert;
        bytes32[] _activatedCertificates;
        bytes32[] _pendingCertificatesAdd;
        bytes32[] _pendingCertificatesRemove;
    }
    
    struct _CertificatesPerHolderStruct{
        mapping(address => _CertificateStruct) _CertificatesPerHolder;
    }
   
    mapping(address => _CertificatesPerHolderStruct) _CertificatesPerPool;
    string _ProviderInfo;

    mapping(address => uint256) _AddCertificatePricePerPool;
    mapping(address => uint256) _SubscriptionPricePerPool;
    mapping(address => bool) _submited;

    // modifiers
    modifier isAPool(address pool){
        require(true == isPool(pool));
        _;
    }

    modifier isCertificateActivated(bool YesOrNo, bytes32 cert, address pool, address holder){
        if(false == YesOrNo) require(false == isCertificate(pool, cert, holder), "EC6");
        else require(true == isCertificate(pool, cert, holder), "EC7");
        _;
    }

    modifier isCertificatePending(bool YesOrNo, bytes32 cert, address pool, address holder){
        if(false == YesOrNo) require(false == isCertificatePendingToAdded(pool, cert, holder) && 
                                    false == isCertificatePendingToRemoved(pool, cert, holder), "EC27");
        else require(true == isCertificatePendingToAdded(pool, cert, holder) || 
                    true == isCertificatePendingToRemoved(pool, cert, holder), "EC28");
        _;
    }

    modifier isCertificatePendingToAdd(bool YesOrNo, bytes32 cert, address pool, address holder){
        if(false == YesOrNo) require(false == isCertificatePendingToAdded(pool, cert, holder), "EC27");
        else require(true == isCertificatePendingToAdded(pool, cert, holder), "EC28");
        _;
    }

    modifier isCertificatePendingToRemove(bool YesOrNo, bytes32 cert, address pool, address holder){
        if(false == YesOrNo) require(false == isCertificatePendingToRemoved(pool, cert, holder), "EC27");
        else require(true == isCertificatePendingToRemoved(pool, cert, holder), "EC28");
        _;
    }

     // Constructor
    constructor(address[] memory owners,  uint256 minOwners, string memory ProviderInfo) 
        MultiSigContract(owners, minOwners, TotalEntities, _Label, _ownerIdProviders)
    payable
    {
        _ProviderInfo = ProviderInfo;
    }

    // POOL CRUD Operations
    function subscribeToPublicPool(address pool, string calldata poolInfo, uint256 AddCertificatePrice, uint256 SubscriptionPrice) external override{
        InternaladdPool(pool, poolInfo, AddCertificatePrice, SubscriptionPrice);
        if(true == isPool(pool)){
            MultiSigCertificatesPool poolToSubscribe = PublicCertificatesPool(pool);
            poolToSubscribe.addProvider{value:_SubscriptionPricePerPool[pool]}(address(this), _ProviderInfo);
        }
    }

    function addPool(address pool, string calldata poolInfo, uint256 AddCertificatePrice) external override{
        InternaladdPool(pool, poolInfo, AddCertificatePrice, 0);
    }

    function InternaladdPool(address pool, string calldata poolInfo, uint256 AddCertificatePrice, uint256 SubscriptionPrice) internal{
        addEntity(pool, poolInfo, _poolId);
        if(false == _submited[pool]){
            _AddCertificatePricePerPool[pool] = AddCertificatePrice;
            _SubscriptionPricePerPool[pool] = SubscriptionPrice;
            _submited[pool] = true;
        }
    }

    function removePool(address pool) external override{
       removeEntity(pool, _poolId); 
    }

    function validatePool(address pool) external override{
        validateEntity(pool, _poolId);
    }

    function rejectPool(address pool) external override{
        rejectEntity(pool, _poolId);
    }

    function removePricesForPool(address entity, uint listId) internal
    {
        if(listId == _poolId){
            delete(_submited[entity]);
            delete(_AddCertificatePricePerPool[entity]);
            delete(_SubscriptionPricePerPool[entity]);
        }
    }

    function onEntityValidated(address entity, uint listId, bool addOrRemove) internal override
    {
        if(false == addOrRemove)removePricesForPool(entity, listId);
    }

    function onEntityRejected(address entity, uint listId, bool addOrRemove) internal override{}
    
    function retrievePool(address pool) external override view returns (string memory, bool, uint256){
        string memory poolInfo;
        bool isActivated;

        (poolInfo, isActivated) = InternalRetrievePool(pool);
        return (poolInfo, isActivated, _AddCertificatePricePerPool[pool]);
    }
    
    function InternalRetrievePool(address pool) internal view returns (string memory, bool){
        return retrieveEntity(pool, _poolId);
    }

    function retrieveAllPools() external override view returns (address[] memory){
        return retrieveAllEntities(_poolId);
    }

    function isPool(address pool) public view returns (bool){
        return(isEntity(pool, _poolId));
    }
    
    // Certificates management
     function addCertificate(address pool, bytes32 CertificateHash, address holder) external override
        isAPool(pool)
        isAnOwner
        isCertificateActivated(false, CertificateHash, pool, holder) 
        isCertificatePendingToAdd(false, CertificateHash, pool, holder)
     {
        _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesAdd.push(CertificateHash);
        
        internalValidateCertificate(pool, CertificateHash, holder);
     }
     
     function removeCertificate(address pool, bytes32 CertificateHash, address holder) external override
        isAPool(pool)
        isAnOwner
        isCertificateActivated(true, CertificateHash, pool, holder) 
        isCertificatePendingToRemove(false, CertificateHash, pool, holder)
     {
         _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesRemove.push(CertificateHash);

         internalValidateCertificate(pool, CertificateHash, holder);
     }

     function validateCertificate(address pool, bytes32 CertificateHash, address holder) external override
        isAPool(pool)
        isAnOwner
        isCertificatePending(true, CertificateHash, pool, holder)
        HasNotAlreadyVoted(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash])
     {
        internalValidateCertificate(pool, CertificateHash, holder);
     }

     function internalValidateCertificate(address pool, bytes32 CertificateHash, address holder) internal
     {
         _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._Validations.push(msg.sender);

         if(Library.CheckValidations(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._Validations.length, _minOwners)){

                if(isCertificatePendingToAdded(pool, CertificateHash, holder)){
                    _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._activated = true; 
                    _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._activatedCertificates.push(CertificateHash);
                    _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesAdd = Library.ArrayRemoveResize(Library.FindPosition(CertificateHash, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesAdd), _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesAdd);
                    manipulateCertificate(pool, CertificateHash, holder, true);
                    deleteVoters(pool, CertificateHash, holder);
                    //emit _AddEntityValidationIdEvent(_entitiesLabel[listId], entity, _Entities[listId]._entities[entity]._Info);
                }
                else{
                    _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._activatedCertificates = Library.ArrayRemoveResize(Library.FindPosition(CertificateHash, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._activatedCertificates), _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._activatedCertificates);
                    _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesRemove = Library.ArrayRemoveResize(Library.FindPosition(CertificateHash, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesRemove), _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesRemove);
                    manipulateCertificate(pool, CertificateHash, holder, false);
                    delete(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]);
                    //emit _RemoveEntityValidationIdEvent(_entitiesLabel[listId], entity, _Entities[listId]._entities[entity]._Info);
                }

                
            }
     }
     
     function rejectCertificate(address pool, bytes32 CertificateHash, address holder) external override
        isAPool(pool)
        isAnOwner
        isCertificatePending(true, CertificateHash, pool, holder)
        HasNotAlreadyVoted(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash])
     {
            if(isCertificatePendingToAdded(pool, CertificateHash, holder)){
                    _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesAdd = Library.ArrayRemoveResize(Library.FindPosition(CertificateHash, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesAdd), _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesAdd);
                    //onEntityRejected(entity, listId, true);
                    delete(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._Info);
                    deleteVoters(pool, CertificateHash, holder);
                    //emit _AddEntityRejectionIdEvent(_entitiesLabel[listId], entity, _Entities[listId]._entities[entity]._Info);
                }
            else{
                    _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesRemove = Library.ArrayRemoveResize(Library.FindPosition(CertificateHash, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesRemove), _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesRemove);
                    //onEntityRejected(entity, listId, false);
                    deleteVoters(pool, CertificateHash, holder);
                    //emit _RemoveEntityRejectionIdEvent(_entitiesLabel[listId], entity, _Entities[listId]._entities[entity]._Info);
                }
     }

    function deleteVoters(address pool, bytes32 CertificateHash, address holder) internal{
        delete(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._Rejections);
        delete(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._Validations);
    }
    
    function manipulateCertificate(address pool, bytes32 CertificateHash, address holder, bool addOrRemove) internal
    {
        MultiSigCertificatesPool poolToSend;
        (string memory p ,) = InternalRetrievePool(pool);

        if(keccak256(abi.encodePacked("Private")) == keccak256(abi.encodePacked((p)))){
                poolToSend = PrivateCertificatesPool(pool);
            }
        else {
                poolToSend = PublicCertificatesPool(pool);
        }

        if(addOrRemove){
                poolToSend.addCertificate{value:_AddCertificatePricePerPool[pool]}(CertificateHash, holder);
            }
        else{
               poolToSend.removeCertificate(CertificateHash, holder);
        }
            
        //delete(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]);
        
    }

    function isCertificate(address pool, bytes32 CertificateHash, address holder) public view returns(bool){
        return _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._activated;
    }

    function isCertificatePendingToAdded(address pool, bytes32 CertificateHash, address holder) internal view returns(bool)
    {
        bytes32[] memory pendingToBeAdded = _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesAdd;
        for(uint i=0; i < pendingToBeAdded.length; i++){
            if(CertificateHash == pendingToBeAdded[i]) return true;
        }
        return false;
    }

    function isCertificatePendingToRemoved(address pool, bytes32 CertificateHash, address holder) internal view returns(bool)
    {
        bytes32[] memory pendingToBeRemoved = _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._pendingCertificatesRemove;
        for(uint i=0; i < pendingToBeRemoved.length; i++){
            if(CertificateHash == pendingToBeRemoved[i]) return true;
        }
        return false;
    }
    
    receive() external override payable{}
    
 }