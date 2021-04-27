// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 
import "./Certificates.sol";

 /* 
 Actors : Chair Person, Anyone
 Token : Proposals

 1- Anyone can submit proposals (paying a fee)
 2- Chair Person can approve proposals creating Providers in Certificates Contract


 Proposals lifecycle
    Proposals Creation : Anyone (paying fee)
    Proposals Update : 
    Proposals Remove :   
    Proposals Validations : Only Chair Person  

 */

contract Proposals{
    enum proposalState { NOT_SUBMITTED, PENDING, APPROVED, REJECTED }
    uint constant _PriceWei = 10;

    Certificates  _CertificatesContract;
    
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
        _CertificatesContract = new Certificates(listOfOwners);
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
        _CertificatesContract.addProvider(provider, _proposals[provider]._providerInfo);
    }
    
    function retrieveProposal(address provider) public view returns (uint, string memory) {
        require(proposalState.NOT_SUBMITTED != _proposals[provider]._state, "This proposal does not exist");
        return (uint(_proposals[provider]._state), _proposals[provider]._providerInfo);
    }
    
    // Contract basic information

    function retrieveCertificatesContractAddress() public view returns (Certificates) {
        return _CertificatesContract;
    }
    
    function retrieveChairPerson() public view returns (address) {
        return _chairperson;
    }
    
}