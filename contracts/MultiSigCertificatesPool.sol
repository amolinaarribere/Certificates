// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./MultiSigContract.sol";

abstract contract MultiSigCertificatesPool is MultiSigContract {
    
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
        mapping(bytes => address) _CertificateFromProvider;
        bytes[] _ListOfCertificates;
    }
    
    mapping(address => _CertificatePerHolder) private _CertificatesPerHolder;

    // modifiers
    modifier isAProvider(){
        require(true == isProvider(msg.sender), "Only Providers are allowed to perform this action");
        _;
    }

    modifier isTheProvider(address holder, bytes memory CertificateHash){
        require(msg.sender == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash], "Not allowed to update this particular Certificate");
        _;
    }

    modifier isTheProviderOrHimself(address holder, bytes memory CertificateHash){
        require(msg.sender == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash] || msg.sender == holder, "Not allowed to remove this particular Certificate");
        _;
    }
    
    modifier CertificateDoesNotExist(address holder, bytes memory CertificateHash){
        require(address(0) == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash], "Certificate already exist");
        _;
    }
    
    // Constructor
    constructor(address[] memory owners,  uint256 minOwners) 
        MultiSigContract(owners, minOwners, TotalEntities, _Label, _ownerIdCertificates)
    payable
    {}

    // PROVIDERS CRUD Operations
    function addProvider(address provider, string memory providerInfo) external virtual;

    function removeProvider(address provider) external virtual;
    
    function updateProvider(address provider, string memory providerInfo) external {
       updateEntity(provider, bytes(providerInfo), _providerId);
    }
    
    function retrieveProvider(address provider) external view returns (string memory){
        return string(retrieveEntity(provider, _providerId));
    }

    function retrieveAllProviders() external view returns (address[] memory){
        return(retrieveAllEntities(_providerId));
    }
    
    function retrieveTotalProviders() external view returns (uint){
        return (retrieveTotalEntities(_providerId));
    }

    function isProvider(address provider) public view returns (bool){
        return(isEntity(provider, _providerId));
    }
    
    // Certificates CRUD Operations
    function addCertificate(bytes memory CertificateHash, address holder) external 
        isAProvider 
        NotEmpty(CertificateHash)
        CertificateDoesNotExist(holder, CertificateHash)
    {
        _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash] = msg.sender;
        _CertificatesPerHolder[holder]._ListOfCertificates.push(CertificateHash);

        emit _AddCertificateIdEvent(msg.sender, holder);
    }
    
    function removeCertificate(bytes memory CertificateHash, address holder) external 
        isAProvider 
        isTheProviderOrHimself(holder, CertificateHash) 
    {
        address provider = _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash];
        bytes[] memory listOfCert = _CertificatesPerHolder[holder]._ListOfCertificates;
        
        for(uint i=0; i < listOfCert.length; i++){
            if(CertificateHash == listOfCert[i]){
                ArrayRemoveResize(i, _CertificatesPerHolder[holder]._ListOfCertificates);
                break;
            }
        }
        
        delete _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash];
        
        emit _RemoveCertificateIdEvent(provider, holder);

    }
    
    function ArrayRemoveResize(uint index, bytes[] memory array) internal 
        isIdCorrect(index, array.length)
    pure returns(bytes[] memory) 
    {
        for (uint i = index; i < array.length-1; i++){
            array[i] = array[i+1];
        }
        
        delete array[array.length-1];
        
        return array;
    }

    function retrieveCertificateProvider(bytes memory CertificateHash, address holder) external 
    view returns (address)
    {
        return (_CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash]);
    }

    function retrieveTotalCertificatesByHolder(address holder) external view returns (uint256){
        return (_CertificatesPerHolder[holder]._ListOfCertificates.length);
    }


    function retrieveCertificatesByProviderAndHolder(address provider, address holder) external view returns (bytes[] memory)
    {
        bytes[] storage ListOfCertificatesIdByProviderAndHolder;
        bytes[] memory  listOfCert = _CertificatesPerHolder[holder]._ListOfCertificates;
        
        for(uint i=0; i < listOfCert.length; i++){
            if(_CertificatesPerHolder[holder]._CertificateFromProvider[listOfCert[i]] == provider){
                ListOfCertificatesIdByProviderAndHolder.push(listOfCert[i]);
            }
        }

        return (ListOfCertificatesIdByProviderAndHolder);
    } 

}