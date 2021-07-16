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
        mapping(bytes32 => Library._entityIdentity) _cert;
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
        addEntity(pool, poolInfo, _poolId);
    }

    function removePool(address pool) external override{
       removeEntity(pool, _poolId); 
    }
    
    function retrievePool(address pool) external override view returns (string memory, bool){
        return InternalRetrievePool(pool);
    }
    
    function InternalRetrievePool(address pool) internal view returns (string memory, bool){
        return (retrieveEntity(pool, _poolId));
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
     function addCertificate(address pool, bytes32 CertificateHash, address holder) external override
     {
        manipulateCertificate(pool, CertificateHash, holder, Library.Actions.Add);
     }
     
     function removeCertificate(address pool, bytes32 CertificateHash, address holder) external override
     {
         manipulateCertificate(pool, CertificateHash, holder, Library.Actions.Remove);
     }

    
    function manipulateCertificate(address pool, bytes32 CertificateHash, address holder, Library.Actions act) 
        isAPool(pool)
        isAnOwner
        HasNotAlreadyVoted(act, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash])
    internal{
        
        uint validations;
        
        if(act == Library.Actions.Add){
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
            
            
            if(act == Library.Actions.Add){
                poolToSend.addCertificate(CertificateHash, holder);
            }
            else{
               poolToSend.removeCertificate(CertificateHash, holder);
            }
            
            delete(_CertificatesPerPool[pool]._CertificatesPerHolder[holder]._cert[CertificateHash]);
            
        }
    }
    
 }