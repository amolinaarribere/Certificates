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

abstract contract CertificatesPool {
    
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
        uint256 _id;
        bool _activated;
        string _Info;
        uint256 _addValidations;
        mapping(address => bool) _AddValidated;
        uint256 _removeValidations;
        mapping(address => bool) _RemoveValidated;
    }

    struct _entityStruct{
        mapping(address => _entityIdentity) _entities;
        address[] _activatedEntities;
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
    constructor(address[] memory owners,  uint256 minOwners) payable{
        require(minOwners <= owners.length, "Not enough owners provided to meet the minOwners requirement");
        require(minOwners > 0, "At least 1 minimum owner");

        _certificateEntities.push();
        _certificateEntities.push();

        _minOwners = minOwners;
        for (uint i=0; i < owners.length; i++) {
            _certificateEntities[_ownerId]._entities[owners[i]]._activated = true;
            _certificateEntities[_ownerId]._activatedEntities.push(owners[i]);
            _numberOfEntities[_ownerId] += 1;  
        }
    }

    // Generic Entity CRUD Operation
    function CheckValidations(uint256 fieldToValidate) internal view returns(bool){
        if(fieldToValidate < _minOwners) return false;
        return true;
    }

    function addEntity(address entity, string memory entityInfo, uint listId) internal  {
        require(_numberOfEntities.length > listId, "provided list Id is wrong");
        require(true == isOwner(msg.sender), "Not allowed to add entities");
        require(false == _certificateEntities[listId]._entities[entity]._activated, "Entity already activated");
        require(false == _certificateEntities[listId]._entities[entity]._AddValidated[msg.sender], "Owner has already voted");

        if(0 == _certificateEntities[listId]._entities[entity]._addValidations) _certificateEntities[listId]._entities[entity]._Info = entityInfo;
        _certificateEntities[listId]._entities[entity]._addValidations += 1;
        _certificateEntities[listId]._entities[entity]._AddValidated[msg.sender] = true;
        if(CheckValidations(_certificateEntities[listId]._entities[entity]._addValidations)){
            _certificateEntities[listId]._entities[entity]._activated = true;
            _certificateEntities[listId]._entities[entity]._id = _certificateEntities[listId]._activatedEntities.length;
            _certificateEntities[listId]._activatedEntities.push(entity);
            _numberOfEntities[listId] += 1;

            if(_ownerId == listId) emit _AddOwnerValidationIdEvent(entity);
            else emit _AddProviderValidationIdEvent(entity); 
        }
    }

    function removeEntity(address entity, uint listId) internal {
        require(_numberOfEntities.length > listId, "provided list Id is wrong");
        require(true == isOwner(msg.sender) || msg.sender == entity, "Not allowed to remove entity");
        require(true == _certificateEntities[listId]._entities[entity]._activated, "Entity not activated");
        require(false == _certificateEntities[listId]._entities[entity]._RemoveValidated[msg.sender], "Owner has already voted");

        _certificateEntities[listId]._entities[entity]._removeValidations += 1;
        _certificateEntities[listId]._entities[entity]._RemoveValidated[msg.sender] = true;
        if(msg.sender == entity || CheckValidations(_certificateEntities[listId]._entities[entity]._removeValidations)){
            delete(_certificateEntities[listId]._activatedEntities[_certificateEntities[listId]._entities[entity]._id]);
            delete(_certificateEntities[listId]._entities[entity]);
            _numberOfEntities[listId] -= 1;

            if(_ownerId == listId) emit _RemoveOwnerValidationIdEvent(entity);
            else emit _RemoveProviderValidationIdEvent(entity); 
        }  
       
    }

    function updateEntity(address entity, string memory entityInfo, uint listId) internal {
       require(msg.sender == entity, "Not allowed to update entity");
       require(true == isEntity(entity, listId), "Entity not activated") ;

       _certificateEntities[listId]._entities[entity]._Info = entityInfo;
    }

    function retrieveEntity(address entity, uint listId) internal view returns (string memory){
        require(true == isEntity(entity, listId), "Entity does not exist");

        return _certificateEntities[listId]._entities[entity]._Info;
    }

    function retrieveAllEntities(uint listId) internal view returns (address[] memory){
        require(_numberOfEntities.length > listId, "provided list Id is wrong");

        address[] memory activatedEntities = new address[](_numberOfEntities[listId]);
        uint counter;

        for(uint i=0; i < _certificateEntities[listId]._activatedEntities.length; i++){
            if(address(0) != _certificateEntities[listId]._activatedEntities[i]){
                activatedEntities[counter] = _certificateEntities[listId]._activatedEntities[i];
                counter += 1;
            }
        }

        return(activatedEntities);
    }

    function retrieveTotalEntities(uint listId) internal view returns (uint){
        return (_numberOfEntities[listId]);
    }

    function isEntity(address entity, uint listId) internal view returns (bool){
        return(_certificateEntities[listId]._entities[entity]._activated);
    }

    // OWNERS CRUD Operations
    function addOwner(address owner, string memory ownerInfo) external {
        addEntity(owner, ownerInfo, _ownerId);
    }
    
    function removeOwner(address owner) external {
        removeEntity(owner, _ownerId);
    }

    function updateOwner(address owner, string memory ownerInfo) external {
       updateEntity(owner, ownerInfo, _ownerId);
    }
    
    function retrieveOwner(address owner) external view returns (string memory){
        return retrieveEntity(owner, _ownerId);
    }

    function retrieveAllOwners() external view returns (address[] memory){
        return(retrieveAllEntities(_ownerId));
    }

    function retrieveTotalOwners() external view returns (uint){
        return (retrieveTotalEntities(_ownerId));
    }

    function isOwner(address owner) public view returns (bool){
        return(isEntity(owner, _ownerId));
    }
    
    // PROVIDERS CRUD Operations
    function addProvider(address provider, string memory providerInfo) external virtual;

    function removeProvider(address provider) external {
       removeEntity(provider, _providerId); 
    }
    
    function updateProvider(address provider, string memory providerInfo) external {
       updateEntity(provider, providerInfo, _providerId);
    }
    
    function retrieveProvider(address provider) external view returns (string memory){
        return retrieveEntity(provider, _providerId);
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
    function addCertificate(string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash, address holder) external {
        require(true == isProvider(msg.sender), "Not allowed to manage Certificates");
        require(0 < CertificateHash.length && (0 < bytes(CertificateLocation).length || 0 < bytes(CertificateContent).length), "Certificate is empty");

        _CertificatesPerHolder[holder].push(_Certificate(msg.sender, CertificateContent, CertificateLocation, CertificateHash));
        uint256 Id = _CertificatesPerHolder[holder].length - 1;
        emit _AddCertificateIdEvent(msg.sender, holder, Id);
    }
    
    function removeCertificate(uint256 CertificateId, address holder) external {
        require(true == isProvider(msg.sender), "Not allowed to manage Certificates");
        require(CertificateId < _CertificatesPerHolder[holder].length, "Certificate does not exist");
        require(msg.sender == _CertificatesPerHolder[holder][CertificateId]._Provider || msg.sender == holder, "Not allowed to remove this particular Certificate");

        address provider = _CertificatesPerHolder[holder][CertificateId]._Provider;
        delete _CertificatesPerHolder[holder][CertificateId];
        emit _RemoveCertificateIdEvent(provider, holder, CertificateId);

    }
    
    function updateCertificate(uint256 CertificateId, address holder, string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash) external {
        require(true == isProvider(msg.sender), "Not allowed to manage Certificates");
       require(CertificateId < _CertificatesPerHolder[holder].length, "Certificate does not exist");
       require(msg.sender == _CertificatesPerHolder[holder][CertificateId]._Provider, "Not allowed to update this particular Certificate");

       if(0 < bytes(CertificateContent).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateContent = CertificateContent;
       if(0 < bytes(CertificateLocation).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateLocation = CertificateLocation;
       if(0 < bytes(CertificateHash).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateHash = CertificateHash;

       emit _UpdateCertificateIdEvent(_CertificatesPerHolder[holder][CertificateId]._Provider, holder, CertificateId);
    }

    function retrieveCertificate(uint256 CertificateId, address holder) external view returns (address, string memory, string memory, bytes memory){
        require(CertificateId < _CertificatesPerHolder[holder].length, "Certificate does not exist");

        return (_CertificatesPerHolder[holder][CertificateId]._Provider, 
            _CertificatesPerHolder[holder][CertificateId]._CertificateContent,
            _CertificatesPerHolder[holder][CertificateId]._CertificateLocation,
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