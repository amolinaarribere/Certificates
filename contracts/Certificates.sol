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
 2- Owners manage any owner and any Provider
 3- Providers manage only themselves and their own Certificates
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
    
    event _AddCertificateIdEvent(address, address, uint256);
    event _RemoveCertificateIdEvent(address, address, uint256);
    event _UpdateCertificateIdEvent(address, address, uint256);
    
    struct _Certificate{
        address _Provider;
        string _CertificateContent;
        string _CertificateLocation;
        bytes _CertificateHash;
    }
    
    struct _providerIdentity{
        bool _activated;
        string _providerInfo;
    }

    // Contract Creator
    address _creator;

    // Providers
    mapping(address => _providerIdentity) public _providers;
    uint256 _numberOfProviders;

    // Holders
    mapping(address => _Certificate[]) private _CertificatesPerHolder;

    // list and number of owners
    mapping(address => bool) public _owners;
    uint256 _numberOfOwners;
    

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
    
    // Certificats CRUD Operations

    function addCertificate(string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash, address holder) public {
        require(true == _providers[msg.sender]._activated, "Not allowed to add Certificates");
        require(0 < CertificateHash.length && (0 < bytes(CertificateLocation).length || 0 < bytes(CertificateContent).length), "Certificate is empty");

        _CertificatesPerHolder[holder].push(_Certificate(msg.sender, CertificateContent, CertificateLocation, CertificateHash));
        uint256 Id = _CertificatesPerHolder[holder].length - 1;
        emit _AddCertificateIdEvent(msg.sender, holder, Id);
    }
    
    function removeCertificate(uint256 CertificateId, address holder) public {
        require(CertificateId < _CertificatesPerHolder[holder].length, "Certificate does not exist");
        require(msg.sender == _CertificatesPerHolder[holder][CertificateId]._Provider || msg.sender == holder, "Not allowed to remove this particular Certificate");

        address provider = _CertificatesPerHolder[holder][CertificateId]._Provider;
        delete _CertificatesPerHolder[holder][CertificateId];
        emit _RemoveCertificateIdEvent(provider, holder, CertificateId);

    }
    
    function updateCertificate(uint256 CertificateId, address holder, string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash) public {
       require(CertificateId < _CertificatesPerHolder[holder].length, "Certificate does not exist");
       require(msg.sender == _CertificatesPerHolder[holder][CertificateId]._Provider, "Not allowed to update this particular Certificate");

       if(0 < bytes(CertificateContent).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateContent = CertificateContent;
       if(0 < bytes(CertificateLocation).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateLocation = CertificateLocation;
       if(0 < bytes(CertificateHash).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateHash = CertificateHash;

       emit _UpdateCertificateIdEvent(_CertificatesPerHolder[holder][CertificateId]._Provider, holder, CertificateId);
    }

    function retrieveCertificate(uint256 CertificateId, address holder) public view returns (address, string memory, string memory, bytes memory){
        require(CertificateId < _CertificatesPerHolder[holder].length, "Certificate does not exist");

        return (_CertificatesPerHolder[holder][CertificateId]._Provider, 
            _CertificatesPerHolder[holder][CertificateId]._CertificateContent,
            _CertificatesPerHolder[holder][CertificateId]._CertificateLocation,
            _CertificatesPerHolder[holder][CertificateId]._CertificateHash);
    }

    function retrieveTotalCertificatesByHolder(address holder) public view returns (uint256){
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

    function retrieveCertificatesByProviderAndHolder(address provider, address holder) public view returns (uint256[] memory){
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