// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

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

    // Struct Certificates
    struct _ProviderCertificate{
        bytes _Hash;
        bool _activated;
        uint256 _addValidations;
        mapping(address => bool) _AddValidated;
        uint256 _updateValidations;
        mapping(address => bool) _UpdateValidated;
        address[] _UpdatedValidatedList;
        uint256 _removeValidations;
        mapping(address => bool) _RemoveValidated;
    }

    struct _HashToCertStruct{
        mapping(bytes32 => _ProviderCertificate) _HashToCert;
    }
    
    struct _CertificatesPerHolderStruct{
        mapping(address => _HashToCertStruct) _CertificatesPerHolder;
    }
    
    mapping(address => _CertificatesPerHolderStruct) _CertificatesPerPool;

    // modifiers
    modifier isCertificateActivated(bool YesOrNo, address pool, address holder, bytes32 certHash){
        if(false == YesOrNo) require(false == _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[certHash]._activated, "Certificate already activated");
        else require(true == _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[certHash]._activated, "Certificate must be activated");
        _;
    }

    modifier HasNotAlreadyVoted(Library.Actions action, address pool, address holder, bytes32 certHash){
        string memory message = "Owner has already voted";
        if(Library.Actions.Remove == action) require(false == _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[certHash]._RemoveValidated[msg.sender], message);
        else if(Library.Actions.Update == action) require(false == _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[certHash]._UpdateValidated[msg.sender], message);
        else require(false == _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[certHash]._AddValidated[msg.sender], message);
        _;
    }

    modifier isAPool(address pool){
        require(true == isPool(pool));
        _;
    }

     // Constructor
    constructor(address[] memory owners,  uint256 minOwners) 
        MultiSigContract(owners, minOwners, TotalEntities, _Label, _ownerIdProviders)
    payable
    {}

    // POOL CRUD Operations
    function addPool(address pool, string memory poolInfo) external override{
        addEntity(pool, poolInfo, _poolId);
    }

    function removePool(address pool) external override{
       removeEntity(pool, _poolId); 
    }
    
    function updatePool(address pool, string memory poolInfo) external override{
       updateEntity(pool, poolInfo, _poolId);
    }
    
    function retrievePool(address pool) external override view returns (string memory){
        return retrieveEntity(pool, _poolId);
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
     function addCertificate(address pool, string memory CertificateContent, string memory CertificateLocation, bytes32 CertificateHash, address holder) external
        isAPool(pool)
        isAnOwner
        isCertificateActivated(false, pool, holder, CertificateHash)
        HasNotAlreadyVoted(Library.Actions.Add, pool, holder, CertificateHash)
     override
     {
         if(0 == _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._addValidations) {
             _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._certificate._Provider = address(this);
             _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._certificate._CertificateContent = CertificateContent;
             _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._certificate._CertificateLocation = CertificateLocation;
             _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._certificate._CertificateHash = CertificateHash;
         }
            

        _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._addValidations += 1;
        _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._AddValidated[msg.sender] = true;

        if(Library.CheckValidations(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._addValidations, _minOwners)){
            _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._HashToCert[CertificateHash]._activated = true;
        }
     }


    
 }