// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./MultiSigContract.sol";

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

abstract contract MultiSigCertificatesPool is MultiSigContract {
    
    // events logs
    event _AddCertificateIdEvent(address, address, uint256);
    event _RemoveCertificateIdEvent(address, address, uint256);
    event _UpdateCertificateIdEvent(address, address, uint256);
    
    // structures
    struct _Certificate{
        address _Provider;
        string _CertificateContent;
        string _CertificateLocation;
        bytes _CertificateHash;
    }

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

    uint256 constant TotalEntities = 2;

    // Owners
    uint256 constant _ownerIdCertificates = 0;
    string constant _ownerLabel = "Owner";
    //uint256 _minOwners;

    // Providers
    uint256 constant _providerId = 1;
    string constant _providerLabel = "Provider";

    string[] _Label = [_ownerLabel, _providerLabel];

    // Holders
    mapping(address => _Certificate[]) private _CertificatesPerHolder;
    
    // Constructor
    constructor(address[] memory owners,  uint256 minOwners) 
        MultiSigContract(owners, minOwners, TotalEntities, _Label, _ownerIdCertificates)
    payable
    {}

    
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
    function addCertificate(string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash, address holder) external 
        isAProvider 
    {
        require(0 < CertificateHash.length && (0 < bytes(CertificateLocation).length || 0 < bytes(CertificateContent).length), "Certificate is empty");

        _CertificatesPerHolder[holder].push(_Certificate(msg.sender, CertificateContent, CertificateLocation, CertificateHash));
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
    
    function updateCertificate(uint256 CertificateId, address holder, string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash) external 
        isAProvider 
        isIdCorrect(CertificateId, _CertificatesPerHolder[holder].length)
        isTheProvider(holder, CertificateId)
    {
       if(0 < bytes(CertificateContent).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateContent = CertificateContent;
       if(0 < bytes(CertificateLocation).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateLocation = CertificateLocation;
       if(0 < bytes(CertificateHash).length)  _CertificatesPerHolder[holder][CertificateId]._CertificateHash = CertificateHash;

       emit _UpdateCertificateIdEvent(_CertificatesPerHolder[holder][CertificateId]._Provider, holder, CertificateId);
    }

    function retrieveCertificate(uint256 CertificateId, address holder) external 
        isIdCorrect(CertificateId, _CertificatesPerHolder[holder].length)
    view returns (address, string memory, string memory, bytes memory)
    {
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