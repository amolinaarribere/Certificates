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
import "./Base/TokenGovernanceBaseContract.sol";
import "./CertisToken.sol";

contract CertificatesPoolManager is TokenGovernanceBaseContract{
    using Library for *;

    // events
    event _NewCertificatesPool(uint256, address, MultiSigCertificatesPool);

    // modfiers
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "EC1");
        _;
    }

    modifier isFromChairPerson(){
        require(msg.sender == _chairperson, "only chair person");
        _;
    }

    // proposition to change
    struct ProposedContractsStruct{
        address NewPublicPoolAddress;
        address NewTreasuryAddress;
        address NewCertisTokenAddress;
    }

    ProposedContractsStruct _ProposedContracts;
    
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

    // init
    bool _init;


    constructor(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) 
    TokenGovernanceBaseContract(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage)
    {
        _chairperson = msg.sender; 
    }

    function Initialize(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress) 
        isFromChairPerson()
    external{
        InternalUpdateContractsVersions(PublicPoolAddress, TreasuryAddress, CertisTokenAddress, true);
    }

    // contracts management

    function updateContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress) external
    {
        InternalUpdateContractsVersions(PublicPoolAddress, TreasuryAddress, CertisTokenAddress, false);
    }

    function InternalUpdateContractsVersions(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, bool fromConstructor) internal
    {
        if(fromConstructor){
            require(false == _init, "contract already initialized");
            _PublicCertificatesPool = PublicCertificatesPool(PublicPoolAddress);
            _CertisToken = CertisToken(CertisTokenAddress); 
            _Treasury = Treasury(TreasuryAddress);
            _PublicCertificatesPool.addTreasury(TreasuryAddress);
            _init = true;
        }
        else{
            addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
            _ProposedContracts.NewPublicPoolAddress = PublicPoolAddress;
            _ProposedContracts.NewTreasuryAddress = TreasuryAddress;
            _ProposedContracts.NewCertisTokenAddress = CertisTokenAddress;
        }
        
    }

    function propositionApproved() internal override
    {
        _PublicCertificatesPool = PublicCertificatesPool(_ProposedContracts.NewPublicPoolAddress);
        _CertisToken = CertisToken(_ProposedContracts.NewCertisTokenAddress); 
        _Treasury = Treasury(_ProposedContracts.NewTreasuryAddress);
        _Treasury.updateContracts(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewCertisTokenAddress);
        _PublicCertificatesPool.addTreasury(_ProposedContracts.NewTreasuryAddress);
        
        removeProposition();
    }

    function propositionRejected() internal override
    {
        removeProposition();
    }

    function propositionExpired() internal override
    {
        removeProposition();
    }

    function removeProposition() internal
    {
       delete(_ProposedContracts);
    }
    
    // functionality

    function createPrivateCertificatesPool(address[] memory owners,  uint256 minOwners) external
    payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewPool);
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
    
    function retrieveConfiguration() external view returns (Treasury, MultiSigCertificatesPool, address, uint) {
        return (_Treasury, _PublicCertificatesPool, _chairperson, address(this).balance);
    }
    
}