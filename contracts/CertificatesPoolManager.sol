// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./Libraries/Library.sol";
import "./PrivateCertificatesPool.sol";
import "./PublicCertificatesPool.sol";
import "./Treasury.sol";

contract CertificatesPoolManager{
    using Library for *;

    // events
    event _NewCertificatesPool(uint256, address, MultiSigCertificatesPool);
    event _SendProposalId(address);

    // modfiers
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "EC1");
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

    // Treasury
    Treasury _Treasury;

    uint _nonce;

    address payable _chairperson;
    
    constructor(address[] memory owners, uint256 minOwners, uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 OwnerRefundPriceWei) payable{
        _chairperson = payable(msg.sender); 
        _PublicCertificatesPool = new PublicCertificatesPool(owners, minOwners);
        _Treasury = new Treasury(PublicPriceWei, PrivatePriceWei, OwnerRefundPriceWei, address(_PublicCertificatesPool));
        _nonce = 0;
    }

    // PRIVATE CERTIFICATE POOL /////////////////////////////////////////////////////////////

    function createPrivateCertificatesPool(address[] memory owners,  uint256 minOwners) external
    payable
    {
         _Treasury.payForNewPool{value:msg.value}();
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

    function retrieveTotalPrivateCertificatesPool() external view returns (uint)
    {
        return(_PrivateCertificatesPools.length);
    }

    // PUBLIC CERTIFICATE POOL /////////////////////////////////////////////////////////////
    
    function sendProposal(address provider, string memory providerInfo) public 
    payable 
    {
        _Treasury.payForNewProposal{value:msg.value}();
       _PublicCertificatesPool.addProvider(provider, providerInfo, _nonce);
       _nonce += 1;

       emit _SendProposalId(provider);
    }
    
    function retrieveConfiguration() public view returns (MultiSigCertificatesPool, address, uint) {
        return (_PublicCertificatesPool, _chairperson, address(this).balance);
    }
    
}