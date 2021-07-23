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

     // Constructor
    constructor(address[] memory owners,  uint256 minOwners, string memory ProviderInfo) 
        MultiSigContract(owners, minOwners, TotalEntities, _Label, _ownerIdProviders)
    payable
    {
        _ProviderInfo = ProviderInfo;
    }

    // POOL CRUD Operations
    function subscribeToPublicPool(address pool, string memory poolInfo, uint256 AddCertificatePrice, uint256 SubscriptionPrice) external override{
        InternaladdPool(pool, poolInfo, AddCertificatePrice, SubscriptionPrice);
        if(true == isPool(pool)){
            MultiSigCertificatesPool poolToSubscribe = PublicCertificatesPool(pool);
            poolToSubscribe.addProvider{value:_SubscriptionPricePerPool[pool]}(address(this), _ProviderInfo);
        }
    }

    function addPool(address pool, string memory poolInfo, uint256 AddCertificatePrice) external override{
        InternaladdPool(pool, poolInfo, AddCertificatePrice, 0);
    }

    function InternaladdPool(address pool, string memory poolInfo, uint256 AddCertificatePrice, uint256 SubscriptionPrice) internal{
        addEntity(pool, poolInfo, _poolId);
        if(false == _submited[pool]){
            _AddCertificatePricePerPool[pool] = AddCertificatePrice;
            _SubscriptionPricePerPool[pool] = SubscriptionPrice;
            _submited[pool] = true;
        }
    }

    function removePool(address pool) external override{
       removeEntity(pool, _poolId); 
       if(false == isPool(pool)){
           delete(_submited[pool]);
           delete(_AddCertificatePricePerPool[pool]);
           delete(_SubscriptionPricePerPool[pool]);
       } 

    }
    
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
     {
        manipulateCertificate(pool, CertificateHash, holder, true);
     }
     
     function removeCertificate(address pool, bytes32 CertificateHash, address holder) external override
     {
         manipulateCertificate(pool, CertificateHash, holder, false);
     }

    
    function manipulateCertificate(address pool, bytes32 CertificateHash, address holder, bool addOrRemove) 
        isAPool(pool)
        isAnOwner
        HasNotAlreadyVoted(addOrRemove, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash])
    internal{
        
        uint validations;
        
        if(addOrRemove){
            _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._AddValidated.push(msg.sender);
            validations = _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._AddValidated.length;
        }
        else{
            _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._RemoveValidated.push(msg.sender);
            validations = _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]._RemoveValidated.length;
        }

        if(Library.CheckValidations(validations, _minOwners)){
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
            
            delete(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]);
            
        }
    }

    
    receive() external override payable{}
    
 }