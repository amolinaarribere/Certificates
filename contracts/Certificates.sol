// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

/* 
 Actors : Owners, Providers, Holders
 Token : Certificates

 1- Owners manage any owner and any Provider
 2- Providers manage only themselves and their own Certificates
 3- Holders can remove their own Certificates

 Providers lifecycle
    Provider Creation : Minimum Number Of Owner
    Provider Update : Provider himself
    Provider Remove : Minimum Number Of Owner or Provider himself

 Certificates lifecycle
    Certificate Creation : Any Provider
    Certificate Update : Only Provider that created Certificate
    Certificate Remove : Only Provider that created Certificate or Holder himself    

 Owners lifecycle
    Owner Creation : Minimum Number Of Owner
    Owner Remove : Minimum Number Of Owner or Owner himself
 */

contract Certificates {
    
    event _AddProviderValidationIdEvent(address);
    event _RemoveProviderValidationIdEvent(address);
    event _AddOwnerValidationIdEvent(address);
    event _RemoveOwnerValidationIdEvent(address);
    event _AddCertificateIdEvent(address, address, uint256);
    event _RemoveCertificateIdEvent(address, address, uint256);
    event _UpdateCertificateIdEvent(address, address, uint256);
    
    struct _Certificate{
        address _Provider;
        string _CertificateContent;
        string _CertificateLocation;
        bytes _CertificateHash;
    }

    struct _entityIdentity{
        bool _activated;
        string _Info;
        uint256 _addValidations;
        uint256 _removeValidations;
    }
   /* 
    struct _providerIdentity{
        bool _activated;
        string _providerInfo;
        uint256 _addValidations;
        uint256 _removeValidations;
    }

    struct _owner{
        bool _activated;
        uint256 _addValidations;
        uint256 _removeValidations;
    }*/

    struct _entityStruct{
        mapping(address => _entityIdentity) _entities;
    }

    // Owners
    uint256 constant _ownerId = 0;
    uint256 _minOwners;

    // Providers
    uint256 constant _providerId = 1;

    // Total Owners and Providers
    uint256[] _numberOfEntities = new uint256[](2);
    _entityStruct[] _certificateEntities;

    // Holders
    mapping(address => _Certificate[]) private _CertificatesPerHolder;
    
    // Constructor

    constructor(address[] memory owners, uint256 minOwners) payable{
        require(minOwners <= owners.length, "Not enough owners provided to meet the minOwners requirement");
        require(minOwners > 0, "At least 1 minimum owner");

        _minOwners = minOwners;
        for (uint i=0; i < owners.length; i++) {
            _certificateEntities[_ownerId]._entities[owners[i]]._activated = true;
            _numberOfEntities[_ownerId] += 1;  
        }
    }

    function CheckValidations(uint256 fieldToValidate) private view returns(bool){
        if(fieldToValidate < _minOwners) return false;
        return true;
    }

    function addEntity(address entity, string memory entityInfo, uint listId) private  {
        require(_numberOfEntities.length > listId, "provided list Id is wrong");
        require(true == _certificateEntities[_ownerId]._entities[msg.sender]._activated, "Not allowed to add entities");
        require(false == _certificateEntities[listId]._entities[entity]._activated, "Entity already activated");

        if(0 == _certificateEntities[listId]._entities[entity]._addValidations) _certificateEntities[listId]._entities[entity]._Info = entityInfo;
        _certificateEntities[listId]._entities[entity]._addValidations += 1;
        if(CheckValidations(_certificateEntities[listId]._entities[entity]._addValidations)){
            _certificateEntities[listId]._entities[entity]._activated = true;
            _numberOfEntities[listId] += 1;
            if(_ownerId == listId) emit _AddOwnerValidationIdEvent(entity);
            else emit _AddProviderValidationIdEvent(entity); 
        }
    }

    function removeEntity(address entity, uint listId) private {
        require(_numberOfEntities.length > listId, "provided list Id is wrong");
       require(true == _certificateEntities[_ownerId]._entities[msg.sender]._activated || msg.sender == entity, "Not allowed to remove entity");
       require(true == _certificateEntities[listId]._entities[entity]._activated, "Entity not activated");

       _certificateEntities[listId]._entities[entity]._removeValidations += 1;

        if(msg.sender == entity || CheckValidations(_certificateEntities[listId]._entities[entity]._removeValidations)){
            delete(_certificateEntities[listId]._entities[entity]);
            _numberOfEntities[listId] -= 1;
            if(_ownerId == listId) emit _RemoveOwnerValidationIdEvent(entity);
            else emit _RemoveProviderValidationIdEvent(entity); 
        }  
       
    }
    
    // PROVIDERS CRUD Operations
    function addProvider(address provider, string memory providerInfo) external {
       addEntity(provider, providerInfo, _providerId);  
    }

    function removeProvider(address provider) public {
       removeEntity(provider, _providerId); 
    }
    
    function updateProvider(address provider, string memory providerInfo) public {
       require(msg.sender == provider, "Not allowed to update providers");
       require(true == _certificateEntities[_providerId]._entities[provider]._activated, "Provider not activated") ;

       _certificateEntities[_providerId]._entities[provider]._Info = providerInfo;
    }
    
    function retrieveProvider(address provider) public view returns (string memory){
        require(true == _certificateEntities[_providerId]._entities[provider]._activated, "Provider does not exist");

        return _certificateEntities[_providerId]._entities[provider]._Info;
    }
    
    function retrieveTotalProviders() public view returns (uint){
        return (_numberOfEntities[_providerId]);
    }
    
    // Certificats CRUD Operations

    function addCertificate(string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash, address holder) public {
        require(true == _certificateEntities[_providerId]._entities[msg.sender]._activated, "Not allowed to add Certificates");
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

    function addOwner(address owner, string memory ownerInfo) public {
        addEntity(owner, ownerInfo, _ownerId);
    }
    
    function removeOwner(address owner) public {
        removeEntity(owner, _ownerId);
    }

    function isOwner(address owner) public view returns (bool){
        return(_certificateEntities[_ownerId]._entities[owner]._activated);
    }
 
    function retrieveTotalOwners() public view returns (uint){
        return (_numberOfEntities[_ownerId]);
    }

}