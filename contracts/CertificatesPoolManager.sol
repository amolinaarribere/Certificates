// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 
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

    event _NewCertificatesPool(uint256, address, CertificatesPool);
    event _SendProposalId(address);

    uint _PublicPriceWei;
    uint _PrivatePoolPriceWei;
    
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

    function createPrivateCertificatesPool(address[] memory owners,  uint256 minOwners) external payable{
        require(msg.value >= _PrivatePoolPriceWei, "Not enough funds");

        PrivateCertificatesPool certificatePool = new PrivateCertificatesPool(owners, minOwners);
        _privateCertificatesPoolStruct memory privateCertificatesPool = _privateCertificatesPoolStruct(msg.sender, certificatePool);
        _PrivateCertificatesPools.push(privateCertificatesPool);

        emit _NewCertificatesPool(_PrivateCertificatesPools.length - 1, privateCertificatesPool._creator, privateCertificatesPool._PrivateCertificatesPool);
    }

    function retrievePrivateCertificatesPool(uint256 certificatePoolId) external view returns ( address, CertificatesPool){
        require(certificatePoolId < _PrivateCertificatesPools.length, "Certificates Pool does not exist");

        return(_PrivateCertificatesPools[certificatePoolId]._creator, _PrivateCertificatesPools[certificatePoolId]._PrivateCertificatesPool);
    }

    // PUBLIC CERTIFICATE POOL /////////////////////////////////////////////////////////////

    function sendProposal(address provider, string memory providerInfo) public payable {
       require(msg.value >= _PublicPriceWei, "Not enough funds");

       _PublicCertificatesPool.addProvider(provider, providerInfo);

       emit _SendProposalId(provider);
    }

    function retrievePublicCertificatesPool() public view returns (CertificatesPool) {
        return _PublicCertificatesPool;
    }
    
    function retrieveChairPerson() public view returns (address) {
        return _chairperson;
    }
    
}