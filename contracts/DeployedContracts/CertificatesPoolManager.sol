// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./PublicCertificatesPool.sol";
import "./PrivatePoolGenerator.sol";
import "./Treasury.sol";
//import "./Proxies/TreasuryProxy.sol";
//import "../Interfaces/ITreasury.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "./CertisToken.sol";
import "../Libraries/AddressLibrary.sol";

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

    function Initialize(address payable PublicPoolProxyAddress, address payable TreasuryProxyAddress, address payable CertisTokenProxyAddress, address payable PrivatePoolGeneratorProxyAddress) 
        isFromChairPerson()
        isNotInitialized()
    external
    {
        _init = true;
        //InternalUpdateContractsVersions(PublicPoolAddress, TreasuryProxyAddress, CertisTokenAddress, PrivatePoolGeneratorAddress, true);
        initProxies(PublicPoolProxyAddress, TreasuryProxyAddress, CertisTokenProxyAddress, PrivatePoolGeneratorProxyAddress);
    }

    // governance : contracts assignment and management
    function updateContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress) external
    {
        _ProposedContracts.NewPublicPoolAddress = PublicPoolAddress;
        _ProposedContracts.NewTreasuryAddress = TreasuryAddress;
        _ProposedContracts.NewCertisTokenAddress = CertisTokenAddress;
        _ProposedContracts.NewPrivatePoolGeneratorAddress = PrivatePoolGeneratorAddress;
        addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);

        //InternalUpdateContractsVersions(PublicPoolAddress, TreasuryAddress, CertisTokenAddress, PrivatePoolGeneratorAddress, false);
    }

/*
    function InternalUpdateContractsVersions(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress, bool fromConstructor) internal
    {
        
        if(fromConstructor){
            assignContracts(PublicPoolAddress, TreasuryProxyAddress, CertisTokenAddress, PrivatePoolGeneratorAddress);
        }
        else{
            _ProposedContracts.NewPublicPoolAddress = PublicPoolAddress;
            _ProposedContracts.NewTreasuryAddress = TreasuryAddress;
            _ProposedContracts.NewCertisTokenAddress = CertisTokenAddress;
            _ProposedContracts.NewPrivatePoolGeneratorAddress = PrivatePoolGeneratorAddress;
            addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
        }
        
    }
*/

    function propositionApproved() internal override
    {
        //assignContracts(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewPrivatePoolGeneratorAddress);
        upgradeProxiesImplementations(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewPrivatePoolGeneratorAddress);
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

    function initProxies(address PublicPoolProxyAddress, address payable TreasuryProxyAddress, address CertisTokenProxyAddress, address PrivatePoolGeneratorProxyAddress) internal
    {
        _PublicCertificatesPool = PublicCertificatesPool(PublicPoolProxyAddress);
        _Treasury = Treasury(TreasuryProxyAddress);
        _CertisToken = CertisToken(CertisTokenProxyAddress);
        _PrivatePoolGenerator = PrivatePoolGenerator(PrivatePoolGeneratorProxyAddress);
    }

    function upgradeProxiesImplementations(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress) internal
    {
        bool success;
        (success, ) = address(_PublicCertificatesPool).call(abi.encodeWithSignature("upgradeTo(address)", PublicPoolAddress));
        require(success);
        (success, ) = address(_Treasury).call(abi.encodeWithSignature("upgradeTo(address)", TreasuryAddress));
        require(success);
        (success, ) = address(_CertisToken).call(abi.encodeWithSignature("upgradeTo(address)", CertisTokenAddress));
        require(success);
        (success, ) = address(_PrivatePoolGenerator).call(abi.encodeWithSignature("upgradeTo(address)", PrivatePoolGeneratorAddress));
        require(success);
    }

/*
    function assignContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress) internal {
        _PublicCertificatesPool = PublicCertificatesPool(PublicPoolAddress);
        _Treasury = Treasury(TreasuryProxyAddress);
        _CertisToken = CertisToken(CertisTokenAddress); 
        _PrivatePoolGenerator = PrivatePoolGenerator(PrivatePoolGeneratorAddress);
        _Treasury.updateContracts(PublicPoolAddress, CertisTokenAddress);
        _PublicCertificatesPool.updateContracts(TreasuryProxyAddress);
        _PrivatePoolGenerator.updateContracts(TreasuryProxyAddress);
       
    }
*/ 
    // configuration
    function retrieveConfiguration() external view returns (address, address, address, address, address, uint) {
        return (address(_PublicCertificatesPool), address(_Treasury), address(_CertisToken), address(_PrivatePoolGenerator), _chairperson, address(this).balance);
    }
    
}