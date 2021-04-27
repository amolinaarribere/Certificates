// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

/* 
 Actors : Creator, Owners, Providers, Holders
 Token : Certificates

 1- Creator (an owner himslef) add Providers and manage Owners (both as creator and owner).
 2- Owners manage other owners and Providers
 3- Providers manage themselves and their own Certificates
 4- Holders can remove their own Certificates

 Providers lifecycle
    Provider Creation : Only creator (proposal contract)
    Provider Update : Any Owner or Provider himself
    Provider Remove : Any Owner or Provider himself

 Certificates lifecycle
    Certificate Creation : Any Provider
    Certificate Update : Only Provider that created Certificate
    Certificate Remove : Only Provider that created Certificate or Holder himself    

 Owners lifecycle
    Owner Creation : Any Owner or Creator
    Owner Remove : Any Owner or Creator
 */

contract Certificates {
    
    event _CertificateIdEvent(uint256);
    
    struct _CertificateToken{
        address _provider;
        address _holder;
        string _Certificate;
    }
    
    struct _providerIdentity{
        bool _activated;
        string _providerInfo;
    }

    // Contract Creator
    address _creator;
    // list and number of providers
    mapping(address => _providerIdentity) public _providers;
    uint256 _numberOfProviders;
    // list and number of owners
    mapping(address => bool) public _owners;
    uint256 _numberOfOwners;
    // list of Certificates
    _CertificateToken[] public _Certificates;

    constructor(address[] memory owners) payable{
        _creator = msg.sender;
        _owners[msg.sender] = true;
        _numberOfOwners = 1;
        for (uint i=0; i<owners.length; i++) {
            if(false == _owners[owners[i]]){
                _owners[owners[i]] = true;
                _numberOfOwners += 1;
            }
            
        }
        _numberOfProviders = 0;
    }
    
    // PROVIDERS CRUD Operations

    function addProvider(address provider, string memory providerInfo) public {
       require(msg.sender == _creator, "Not allowed to add providers");
       require(false == _providers[provider]._activated, "Provider already activated") ;
       _providers[provider]._providerInfo = providerInfo;
       _providers[provider]._activated = true;
       _numberOfProviders += 1;
    }
    
    function removeProvider(address provider) public {
       require(true == _owners[msg.sender] || msg.sender == provider, "Not allowed to remove providers");
       require(true == _providers[provider]._activated, "Provider not activated");
       _providers[provider]._activated = false;
       _numberOfProviders -= 1;
    }
    
    function updateProvider(address provider, string memory providerInfo) public {
       require(true == _owners[msg.sender] || msg.sender == provider, "Not allowed to update providers");
       require(true == _providers[provider]._activated, "Provider not activated") ;
       _providers[provider]._providerInfo = providerInfo;
    }
    
    function retrieveProvider(address provider) public view returns (string memory){
        require(true == _providers[provider]._activated, "Provider does not exist");
        return _providers[provider]._providerInfo;
    }
    
    function retrieveTotalProviders() public view returns (uint){
        return (_numberOfProviders);
    }
    
    // CertificateS CRUD Operations

    function addCertificate(string memory Certificate, address holder) public {
       require(true == _providers[msg.sender]._activated, "Not allowed to add Certificates");
       _Certificates.push(_CertificateToken(msg.sender, holder, Certificate));
       emit _CertificateIdEvent(_Certificates.length - 1);
    }
    
    function removeCertificate(uint256 CertificateTokenId) public {
       require(msg.sender == _Certificates[CertificateTokenId]._provider || msg.sender == _Certificates[CertificateTokenId]._holder, "Not allowed to remove this particular Certificate");
       require(CertificateTokenId < _Certificates.length, "Certificate does not exist");
       delete _Certificates[CertificateTokenId];
    }
    
    function updateCertificate(uint256 CertificateTokenId, string memory Certificate) public {
       require(msg.sender == _Certificates[CertificateTokenId]._provider, "Not allowed to update this particular Certificate");
       require(CertificateTokenId < _Certificates.length, "Certificate does not exist");
       _Certificates[CertificateTokenId]._Certificate = Certificate;
    }

    function retrieveCertificate(uint256 CertificateTokenId) public view returns (address, string memory, address){
        require(CertificateTokenId < _Certificates.length, "Certificate does not exist");
        return (_Certificates[CertificateTokenId]._provider, _Certificates[CertificateTokenId]._Certificate, _Certificates[CertificateTokenId]._holder);
    }
    
    function retrieveTotalCertificate() public view returns (uint){
        return (_Certificates.length);
    }

    // OWNERS CRD Operations

    function addOwner(address owner) public {
       require(true == _owners[msg.sender] || msg.sender == _creator, "Not allowed to add owners");
       require(false == _owners[owner], "Owner already activated");
       _owners[owner] = true;
       _numberOfOwners += 1;
    }
    
    function removeOwner(address owner) public {
       require(true == _owners[msg.sender]  || msg.sender == _creator, "Not allowed to remove owners");
       require(true == _owners[owner], "Owner already de-activated");
       _owners[owner] = false;
        _numberOfOwners -= 1;
    }

    function isOwner(address owner) public view returns (bool){
        return(_owners[owner]);
    }
 
    function retrieveTotalOwners() public view returns (uint){
        return (_numberOfOwners);
    }

     function retrieveCreator() public view returns (address){
        return (_creator);
    }

}