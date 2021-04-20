// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Credentials {
    
    event _credentialIdEvent(uint256);
    
    struct _credentialToken{
        address _provider;
        string _credential;
    }
    
    struct _providerIdentity{
        bool _activated;
        string _providerInfo;
    }

    _credentialToken[] public _credentials;
    mapping(address => _providerIdentity) public _providers;
    uint256 _numberOfProviders;
    mapping(address => bool) public _owners;
    uint256 _numberOfOwners;


    
    constructor(address[] memory owners) payable{
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
    
    function addProvider(address provider, string memory providerInfo) public {
       require(true == _owners[msg.sender], "Not allowed to add providers");
       require (false == _providers[provider]._activated, "Provider already activated") ;
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
       require (true == _providers[provider]._activated, "Provider not activated") ;
       _providers[provider]._providerInfo = providerInfo;
    }
    
    function addCredential(string memory credential) public {
       require(true == _providers[msg.sender]._activated, "Not allowed to add credentials");
       _credentials.push(_credentialToken(msg.sender, credential));
       emit _credentialIdEvent(_credentials.length - 1);
    }
    
    function removeCredential(uint256 credentialTokenId) public {
       require(msg.sender == _credentials[credentialTokenId]._provider, "Not allowed to remove this particular credential");
       require(credentialTokenId < _credentials.length, "Credential does not exist");
       delete _credentials[credentialTokenId];
    }
    
    function addOwner(address owner) public {
       require(true == _owners[msg.sender], "Not allowed to add owners");
       require(false == _owners[owner], "Owner already activated");
       _owners[owner] = true;
       _numberOfOwners += 1;
    }
    
    function removeOwner(address owner) public {
       require(true == _owners[msg.sender], "Not allowed to remove owners");
       require(true == _owners[owner], "Owner already de-activated");
       _owners[owner] = false;
        _numberOfOwners -= 1;
    }


    function retrieveCredential(uint256 credentialTokenId) public view returns (address, string memory){
        return (_credentials[credentialTokenId]._provider, _credentials[credentialTokenId]._credential);
    }
    
    function retrieveProvider(address provider) public view returns (string memory){
        require(true == _providers[provider]._activated, "Provider does not exist");
        return _providers[provider]._providerInfo;
    }
    
    function retrieveTotalProviders() public view returns (uint){
        return (_numberOfProviders);
    }
    
    function retrieveTotalCredential() public view returns (uint){
        return (_credentials.length);
    }
    
    function retrieveTotalOwners() public view returns (uint){
        return (_numberOfOwners);
    }

}

contract Proposals{
    Credentials  _credentialsContract;
    
    uint constant _PriceWei = 10;
    
    struct _proposal{
        bool _activated;
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
    
    function sendProposal(address provider, string memory providerInfo) public payable {
       require(msg.value >= _PriceWei, "Not enough funds");
       _chairperson.transfer(msg.value);
       _proposals[provider]._activated = true;
       _proposals[provider]._providerInfo = providerInfo;
    }
    
    function approveProposal(address provider) public{
        require(msg.sender == _chairperson, "Not allowed to approve proposals");
        require(true == _proposals[provider]._activated, "This proposal does not exist");
        _credentialsContract.addProvider(provider, _proposals[provider]._providerInfo);
    }
    
    
    function retreiveCredentialsContractAddress() public view returns (Credentials) {
        return _credentialsContract;
    }
    
    function retreiveChairPerson() public view returns (address) {
        return _chairperson;
    }
    
}