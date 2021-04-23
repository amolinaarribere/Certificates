// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 /* 
 Actors : Creator, Owners, Providers, Holders
 Token : Credentials

 1- Creator (an owner himslef) add Providers and manage Owners (both as creator and owner).
 2- Owners manage other owners and Providers
 3- Providers manage themselves and their own Credentials
 4- Holders can remove their own Credentials

 Providers lifecycle
    Provider Creation : Only creator (proposal contract)
    Provider Update : Any Owner or Provider himself
    Provider Remove : Any Owner or Provider himself

 Credentials lifecycle
    Credential Creation : Any Provider
    Credential Update : Only Provider that created credential
    Credential Remove : Only Provider that created credential or Holder himself    

 Owners lifecycle
    Owner Creation : Any Owner or Creator
    Owner Remove : Any Owner or Creator
 */

contract Credentials {
    
    event _credentialIdEvent(uint256);
    
    struct _credentialToken{
        address _provider;
        address _holder;
        string _credential;
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
    // list of credentials
    _credentialToken[] public _credentials;

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
    
    // CREDENTIALS CRUD Operations

    function addCredential(string memory credential, address holder) public {
       require(true == _providers[msg.sender]._activated, "Not allowed to add credentials");
       _credentials.push(_credentialToken(msg.sender, holder, credential));
       emit _credentialIdEvent(_credentials.length - 1);
    }
    
    function removeCredential(uint256 credentialTokenId) public {
       require(msg.sender == _credentials[credentialTokenId]._provider || msg.sender == _credentials[credentialTokenId]._holder, "Not allowed to remove this particular credential");
       require(credentialTokenId < _credentials.length, "Credential does not exist");
       delete _credentials[credentialTokenId];
    }
    
    function updateCredential(uint256 credentialTokenId, string memory credential) public {
       require(msg.sender == _credentials[credentialTokenId]._provider, "Not allowed to update this particular credential");
       require(credentialTokenId < _credentials.length, "Credential does not exist");
       _credentials[credentialTokenId]._credential = credential;
    }

    function retrieveCredential(uint256 credentialTokenId) public view returns (address, string memory, address){
        require(credentialTokenId < _credentials.length, "Credential does not exist");
        return (_credentials[credentialTokenId]._provider, _credentials[credentialTokenId]._credential, _credentials[credentialTokenId]._holder);
    }
    
    function retrieveTotalCredential() public view returns (uint){
        return (_credentials.length);
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

}

 /* 
 Actors : Chair Person, Anyone
 Token : Proposals

 1- Anyone can submit proposals (paying a fee)
 2- Chair Person can approve proposals creating Providers in Credentials Contract


 Proposals lifecycle
    Proposals Creation : Anyone (paying fee)
    Proposals Update : 
    Proposals Remove :   
    Proposals Validations : Only Chair Person  

 */

contract Proposals{
    enum proposalState { NOT_SUBMITTED, PENDING, APPROVED, REJECTED }
    uint constant _PriceWei = 10;

    Credentials  _credentialsContract;
    
    struct _proposal{
        //bool _submitted;
        proposalState _state;
        string _providerInfo;
    } 
    
    address payable _chairperson;
    mapping(address => _proposal) public _proposals;
    address[] listOfOwners;
    
    constructor() payable{
        _chairperson = payable(msg.sender);
        listOfOwners.push(address(msg.sender));
        _credentialsContract = new Credentials(listOfOwners);
    }
    
    // PROPOSALS CRUD Operations

    function sendProposal(address provider, string memory providerInfo) public payable {
       require(msg.value >= _PriceWei, "Not enough funds");
       _chairperson.transfer(msg.value);
       //_proposals[provider]._submitted = true;
       _proposals[provider]._state = proposalState.PENDING;
       _proposals[provider]._providerInfo = providerInfo;
    }
    
    function approveProposal(address provider) public{
        require(msg.sender == _chairperson, "Not allowed to approve proposals");
        require(proposalState.NOT_SUBMITTED != _proposals[provider]._state, "This proposal does not exist");
        _credentialsContract.addProvider(provider, _proposals[provider]._providerInfo);
    }
    
    function retrieveProposal(address provider) public view returns (uint, string memory) {
        require(proposalState.NOT_SUBMITTED != _proposals[provider]._state, "This proposal does not exist");
        return (uint(_proposals[provider]._state), _proposals[provider]._providerInfo);
    }
    
    // Contract basic information

    function retrieveCredentialsContractAddress() public view returns (Credentials) {
        return _credentialsContract;
    }
    
    function retrieveChairPerson() public view returns (address) {
        return _chairperson;
    }
    
}