// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./MultiSigContract.sol";

abstract contract MultiSigCertificatesPool is MultiSigContract {
    
    // events logs
    event _AddCertificateIdEvent(address, address, uint256);
    event _RemoveCertificateIdEvent(address, address, uint256);
    event _UpdateCertificateIdEvent(address, address, uint256);

    uint256 constant TotalEntities = 2;

    // Owners
    uint256 constant _ownerIdCertificates = 0;
    string constant _ownerLabel = "Owner";

    // Providers
    uint256 constant _providerId = 1;
    string constant _providerLabel = "Provider";

    string[] _Label = [_ownerLabel, _providerLabel];

    // Holders
    mapping(address => Library._Certificate[]) private _CertificatesPerHolder;

    // modifiers
    modifier isAProvider(){
        require(true == isProvider(msg.sender), "Only Providers are allowed to perform this action");
        _;
    }

    modifier isTheProvider(address holder, uint CertificateId){
        require(msg.sender == _CertificatesPerHolder[holder][CertificateId]._Provider, "Not allowed to update this particular Certificate");
        _;
    }

    modifier isTheProviderOrHimself(address holder, uint CertificateId){
        require(msg.sender == _CertificatesPerHolder[holder][CertificateId]._Provider || msg.sender == holder, "Not allowed to remove this particular Certificate");
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
    {
        _CertificatesPerHolder[holder].push(Library._Certificate(msg.sender, CertificateHash));
        uint256 Id = _CertificatesPerHolder[holder].length - 1;
        emit _AddCertificateIdEvent(msg.sender, holder, Id);
    }
    
    function removeCertificate(uint256 CertificateId, address holder) external 
        isAProvider 
        isIdCorrect(CertificateId, _CertificatesPerHolder[holder].length)
        isTheProviderOrHimself(holder, CertificateId) 
    {
        address provider = _CertificatesPerHolder[holder][CertificateId]._Provider;
        delete _CertificatesPerHolder[holder][CertificateId];
        emit _RemoveCertificateIdEvent(provider, holder, CertificateId);

    }
    
    function updateCertificate(uint256 CertificateId, address holder, bytes memory CertificateHash) external 
        isAProvider 
        isIdCorrect(CertificateId, _CertificatesPerHolder[holder].length)
        isTheProvider(holder, CertificateId)
        NotEmpty(CertificateHash)
    {     
        _CertificatesPerHolder[holder][CertificateId]._CertificateHash = CertificateHash;

       emit _UpdateCertificateIdEvent(_CertificatesPerHolder[holder][CertificateId]._Provider, holder, CertificateId);
    }

    function retrieveCertificate(uint256 CertificateId, address holder) external 
        isIdCorrect(CertificateId, _CertificatesPerHolder[holder].length)
    view returns (address, bytes memory)
    {
        return (_CertificatesPerHolder[holder][CertificateId]._Provider, 
            _CertificatesPerHolder[holder][CertificateId]._CertificateHash);
    }

    function retrieveTotalCertificatesByHolder(address holder) external view returns (uint256){
        return (_CertificatesPerHolder[holder].length);
    }

    function retrieveTotalCertificatesByProviderAndHolder(address provider, address holder) public view returns (uint){
        uint Total = 0;

        for(uint i=0; i < _CertificatesPerHolder[holder].length; i++){
            if(_CertificatesPerHolder[holder][i]._Provider == provider){
                Total += 1;
            }
        }

        return (Total);
    }

    function retrieveCertificatesByProviderAndHolder(address provider, address holder) external view returns (uint256[] memory){
        uint[] memory ListOfCertificatesIdByProviderAndHolder = new uint[](retrieveTotalCertificatesByProviderAndHolder(provider, holder));
        uint counter = 0;

        for(uint i=0; i < _CertificatesPerHolder[holder].length; i++){
            if(_CertificatesPerHolder[holder][i]._Provider == provider){
                ListOfCertificatesIdByProviderAndHolder[counter] = i;
                counter += 1;
            }
        }

        return (ListOfCertificatesIdByProviderAndHolder);
    } 

}