// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./MultiSigContract.sol";
 import "../Interfaces/IPool.sol";

abstract contract MultiSigCertificatesPool is IPool, MultiSigContract {
    
    // events logs
    event _AddCertificateIdEvent(address, address);
    event _RemoveCertificateIdEvent(address, address);

    uint256 constant TotalEntities = 2;

    // Owners
    uint256 constant _ownerIdCertificates = 0;
    string constant _ownerLabel = "Owner";

    // Providers
    uint256 constant _providerId = 1;
    string constant _providerLabel = "Provider";

    string[] _Label = [_ownerLabel, _providerLabel];

    // Holders
    struct _CertificatePerHolder{
        mapping(bytes32 => address) _CertificateFromProvider;
        bytes32[] _ListOfCertificates;
    }
    
    mapping(address => _CertificatePerHolder) private _CertificatesPerHolder;

    // modifiers
    modifier isAProvider(){
        require(true == isProvider(msg.sender), "EC12");
        _;
    }

    modifier isTheProvider(address holder, bytes32 CertificateHash){
        require(msg.sender == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash], "EC13");
        _;
    }

    modifier isTheProviderOrHimself(address holder, bytes32 CertificateHash){
        require(msg.sender == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash] || msg.sender == holder, "EC14");
        _;
    }
    
    modifier CertificateDoesNotExist(address holder, bytes32 CertificateHash){
        require(address(0) == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash], "EC15");
        _;
    }
    
    // Constructor
    constructor(address[] memory owners,  uint256 minOwners) 
        MultiSigContract(owners, minOwners, TotalEntities, _Label, _ownerIdCertificates)
    payable
    {}

    // PROVIDERS CRUD Operations
    function addProvider(address provider, string memory providerInfo) external override virtual;

    function removeProvider(address provider) external override virtual;
    
    function retrieveProvider(address provider) external override view returns (string memory){
        return string(retrieveEntity(provider, _providerId));
    }

    function retrieveAllProviders() external override view returns (address[] memory){
        return(retrieveAllEntities(_providerId));
    }
    
    function retrieveTotalProviders() external override view returns (uint){
        return (retrieveTotalEntities(_providerId));
    }

    function isProvider(address provider) public view returns (bool){
        return(isEntity(provider, _providerId));
    }
    
    // Certificates CRUD Operations
    function addCertificate(bytes32 CertificateHash, address holder) external override
        isAProvider 
        NotEmpty(CertificateHash)
        CertificateDoesNotExist(holder, CertificateHash)
    {
        _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash] = msg.sender;
        _CertificatesPerHolder[holder]._ListOfCertificates.push(CertificateHash);

        emit _AddCertificateIdEvent(msg.sender, holder);
    }
    
    function removeCertificate(bytes32 CertificateHash, address holder) external override
        isAProvider 
        isTheProviderOrHimself(holder, CertificateHash) 
    {
        address provider = _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash];
        bytes32[] memory listOfCert = _CertificatesPerHolder[holder]._ListOfCertificates;
        
        for(uint i=0; i < listOfCert.length; i++){
            if(CertificateHash == listOfCert[i]){
                _CertificatesPerHolder[holder]._ListOfCertificates = Library.ArrayRemoveResize(i, _CertificatesPerHolder[holder]._ListOfCertificates);
                break;
            }
        }
        
        delete _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash];
        
        emit _RemoveCertificateIdEvent(provider, holder);

    }
    

    function retrieveCertificateProvider(bytes32 CertificateHash, address holder) external override
    view returns (address)
    {
        return (_CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash]);
    }

    function retrieveTotalCertificatesByHolder(address holder) external override 
    view returns (uint256)
    {
        return (_CertificatesPerHolder[holder]._ListOfCertificates.length);
    }

    function retrieveCertificatesByHolder(address holder, uint skipFirst, uint max) external override
        isIdCorrect(skipFirst, _CertificatesPerHolder[holder]._ListOfCertificates.length)
    view returns (bytes32[] memory)
    {
        bytes32[] memory ListOfCertificatesByHolder = new bytes32[](max);
        bytes32[] memory listOfCert = _CertificatesPerHolder[holder]._ListOfCertificates;
        uint count = 0;
        uint skipped = 0;
        
        for(uint i=0; i < listOfCert.length; i++){
            if(count >= max) break;
            if(skipFirst > skipped){
                    skipped += 1;
            }
            else{
                ListOfCertificatesByHolder[count] = listOfCert[i];
                count += 1;
            }             
        }

        return (ListOfCertificatesByHolder);
    }


}