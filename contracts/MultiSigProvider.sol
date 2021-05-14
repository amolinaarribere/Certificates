// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 import "./Library.sol";
 import "./IProvider.sol";
 import "./MultiSigContract.sol";


 contract MultiSigProvider is IProvider, MultiSigContract {
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
        mapping(bytes => Library._entityIdentity) _cert;
    }
    
    struct _CertificatesPerHolderStruct{
        mapping(address => _CertificateStruct) _CertificatesPerHolder;
    }
   
    mapping(address => _CertificatesPerHolderStruct) _CertificatesPerPool;

    // modifiers
    modifier isAPool(address pool){
        require(true == isPool(pool));
        _;
    }
    
    modifier isEntityActivated(bool YesOrNo, Library._entityIdentity memory Entity){
        Library.EntityActivated(YesOrNo, Entity);
        _;
    }
    
    modifier HasNotAlreadyVoted(Library.Actions action, Library._entityIdentity memory Entity){
        Library.NotAlreadyVoted(action, Entity);
        _;
    }

     // Constructor
    constructor(address[] memory owners,  uint256 minOwners) 
        MultiSigContract(owners, minOwners, TotalEntities, _Label, _ownerIdProviders)
    payable
    {}

    // POOL CRUD Operations
    function addPool(address pool, string memory poolInfo) external override{
        addEntity(pool, bytes(poolInfo), _poolId);
    }

    function removePool(address pool) external override{
       removeEntity(pool, _poolId); 
    }
    
    function updatePool(address pool, string memory poolInfo) external override{
       updateEntity(pool, bytes(poolInfo), _poolId);
    }
    
    function retrievePool(address pool) external override view returns (string memory){
        return string(retrieveEntity(pool, _poolId));
    }

    function retrieveAllPools() external override view returns (address[] memory){
        return(retrieveAllEntities(_poolId));
    }
    
    function retrieveTotalPools() external override view returns (uint){
        return (retrieveTotalEntities(_poolId));
    }

    function isPool(address pool) public view returns (bool){
        return(isEntity(pool, _poolId));
    }
    
    // Certificates management
     function addCertificate(address pool, bytes memory CertificateHash, address holder) external
        isAPool(pool)
        isAnOwner
        isEntityActivated(false,  _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash])
        HasNotAlreadyVoted(Library.Actions.Add, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash])
     override
     {
        if(0 == _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._AddValidated.length) _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._Info = CertificateHash;

        _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._AddValidated.push(msg.sender);

        if(Library.CheckValidations(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._AddValidated.length, _minOwners)){
            // send to pool
        }
     }
     
     function removeCertificate(address pool, uint256 CertificateId, address holder) external override{}
     
     function updateCertificate(address pool, uint256 CertificateId, address holder, bytes memory CertificateHash) external override{}

    
 }