// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./PublicCertificatesPool.sol";
import "./PrivatePoolGenerator.sol";
import "./Treasury.sol";
import "./Base/TokenGovernanceBaseContract.sol";
import "./CertisToken.sol";
import "./Libraries/AddressLibrary.sol";

contract CertificatesPoolManager is TokenGovernanceBaseContract{
    using AddressLibrary for *;

    // DATA
    // proposition to change
    struct ProposedContractsStruct{
        address NewPublicPoolAddress;
        address NewTreasuryAddress;
        address NewCertisTokenAddress;
        address NewPrivatePoolGeneratorAddress;
    }

    ProposedContractsStruct _ProposedContracts;
    
    // Private Certificate Pools Generator
    PrivatePoolGenerator _PrivatePoolGenerator;

    // Public Certificates Pool structure
    PublicCertificatesPool  _PublicCertificatesPool;

    // Treasury
    Treasury _Treasury;

    // init
    bool _init;

    // MODIFIERS
    modifier isNotInitialized(){
        require(false == _init, "EC26");
        _;
    }


    // CONSTRUCTOR and INITIALIZATION
    constructor(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) 
    TokenGovernanceBaseContract(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage)
    {
        _init = false;
    }

    function Initialize(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress) 
        isFromChairPerson()
        isNotInitialized()
    external
    {
        _init = true;
        InternalUpdateContractsVersions(PublicPoolAddress, TreasuryAddress, CertisTokenAddress, PrivatePoolGeneratorAddress, true);
    }

    // governance : contracts assignment and management
    function updateContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress) external
    {
        InternalUpdateContractsVersions(PublicPoolAddress, TreasuryAddress, CertisTokenAddress, PrivatePoolGeneratorAddress, false);
    }

    function InternalUpdateContractsVersions(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress, bool fromConstructor) internal
    {
        if(fromConstructor){
            assignContracts(PublicPoolAddress, TreasuryAddress, CertisTokenAddress, PrivatePoolGeneratorAddress);
        }
        else{
            _ProposedContracts.NewPublicPoolAddress = PublicPoolAddress;
            _ProposedContracts.NewTreasuryAddress = TreasuryAddress;
            _ProposedContracts.NewCertisTokenAddress = CertisTokenAddress;
            _ProposedContracts.NewPrivatePoolGeneratorAddress = PrivatePoolGeneratorAddress;
            addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
        }
        
    }

    function propositionApproved() internal override
    {
        assignContracts(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewPrivatePoolGeneratorAddress);
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

    function retrieveProposition() external override view returns(string[] memory)
    {
        string[] memory proposition = new string[](4);
        proposition[0] = AddressLibrary.AddressToString(_ProposedContracts.NewPublicPoolAddress);
        proposition[1] = AddressLibrary.AddressToString(_ProposedContracts.NewTreasuryAddress);
        proposition[2] = AddressLibrary.AddressToString(_ProposedContracts.NewCertisTokenAddress);
        proposition[3] = AddressLibrary.AddressToString(_ProposedContracts.NewPrivatePoolGeneratorAddress);
        return proposition;
    }

    function assignContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress) internal {
        _PublicCertificatesPool = PublicCertificatesPool(PublicPoolAddress);
        _CertisToken = CertisToken(CertisTokenAddress); 
        _Treasury = Treasury(TreasuryAddress);
        _PrivatePoolGenerator = PrivatePoolGenerator(PrivatePoolGeneratorAddress);
        _Treasury.updateContracts(PublicPoolAddress, CertisTokenAddress);
        _PublicCertificatesPool.updateContracts(TreasuryAddress);
        _PrivatePoolGenerator.updateContracts(TreasuryAddress);
       
    }
    
    // configuration
    function retrieveConfiguration() external view returns (address, address, address, address, address, uint) {
        return (address(_PublicCertificatesPool), address(_Treasury), address(_CertisToken), address(_PrivatePoolGenerator), _chairperson, address(this).balance);
    }
    
}