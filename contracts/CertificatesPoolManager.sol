// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./Libraries/Library.sol";
import "./PrivateCertificatesPool.sol";
import "./PublicCertificatesPool.sol";

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

contract CertificatesPoolManager{
    using Library for *;

    // events
    event _NewCertificatesPool(uint256, address, MultiSigCertificatesPool);
    event _SendProposalId(address);

    uint _PublicPriceWei;
    uint _PrivatePoolPriceWei;

    // modfiers
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "provided Id is wrong");
        _;
    }

    modifier areFundsEnough(uint minPrice){
        require(msg.value >= minPrice, "Not enough funds");
        _;
    }
    
    // Private Certificates Pool structure
    struct _privateCertificatesPoolStruct{
        address _creator;
        PrivateCertificatesPool _PrivateCertificatesPool;
    } 

    _privateCertificatesPoolStruct[] _PrivateCertificatesPools;
    
    // Public Certificates Pool structure
    PublicCertificatesPool  _PublicCertificatesPool;

    address payable _chairperson;
    
    constructor(address[] memory owners, uint256 minOwners, uint256 PublicPriceWei, uint256 PrivatePriceWei) payable{
        _chairperson = payable(msg.sender);
        _PublicPriceWei = PublicPriceWei;
        _PrivatePoolPriceWei = PrivatePriceWei;
        _PublicCertificatesPool = new PublicCertificatesPool(owners, minOwners);
    }

    // PRIVATE CERTIFICATE POOL /////////////////////////////////////////////////////////////

    function createPrivateCertificatesPool(address[] memory owners,  uint256 minOwners) external
        areFundsEnough(_PrivatePoolPriceWei)
    payable
    {
        PrivateCertificatesPool certificatePool = new PrivateCertificatesPool(owners, minOwners);
        _privateCertificatesPoolStruct memory privateCertificatesPool = _privateCertificatesPoolStruct(msg.sender, certificatePool);
        _PrivateCertificatesPools.push(privateCertificatesPool);

        emit _NewCertificatesPool(_PrivateCertificatesPools.length - 1, privateCertificatesPool._creator, privateCertificatesPool._PrivateCertificatesPool);
    }

    function retrievePrivateCertificatesPool(uint certificatePoolId) external
        isIdCorrect(certificatePoolId, _PrivateCertificatesPools.length)
    view returns (address, MultiSigCertificatesPool)
    {
        return(_PrivateCertificatesPools[certificatePoolId]._creator, _PrivateCertificatesPools[certificatePoolId]._PrivateCertificatesPool);
    }

    // PUBLIC CERTIFICATE POOL /////////////////////////////////////////////////////////////

    function sendProposal(address provider, string memory providerInfo) public 
        areFundsEnough(_PublicPriceWei)
    payable 
    {
       _PublicCertificatesPool.addProvider(provider, providerInfo);

       emit _SendProposalId(provider);
    }

    function retrievePublicCertificatesPool() public view returns (MultiSigCertificatesPool) {
        return _PublicCertificatesPool;
    }
    
    function retrieveChairPerson() public view returns (address) {
        return _chairperson;
    }
    
}