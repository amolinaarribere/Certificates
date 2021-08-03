// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IProxyManager.sol";
import "./PublicCertificatesPool.sol";
import "./PrivateCertificatesPool.sol";
import "./PrivatePoolGenerator.sol";
import "./Treasury.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "./CertisToken.sol";
import "../Libraries/AddressLibrary.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CertificatesPoolManager is IProxyManager, TokenGovernanceBaseContract{
    using AddressLibrary for *;

    // DATA
    // proposition to change
    struct ProposedContractsStruct{
        address NewPublicPoolAddress;
        address NewTreasuryAddress;
        address NewCertisTokenAddress;
        address NewPrivatePoolGeneratorAddress;
        address NewPrivatePoolAddress;
    }

    ProposedContractsStruct _ProposedContracts;
    
    // Private Certificate Pools Generator
    PrivatePoolGenerator _PrivatePoolGenerator;

    // Public Certificates Pool
    PublicCertificatesPool  _PublicCertificatesPool;

    // Treasury
    Treasury _Treasury;

    // Certis Token
    CertisToken _CertisToken;

    // init
    bool _init;

    // MODIFIERS
    modifier isNotInitialized(){
        require(false == _init, "EC26");
        _;
    }


    // CONSTRUCTOR and INITIALIZATION
    /*constructor(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) 
    TokenGovernanceBaseContract(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage)
    {
        _init = false;
    }*/

    constructor(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, msg.sender, address(this));
        _init = false;
    }


    function InitializeContracts(address payable PublicPoolProxyAddress, address payable TreasuryProxyAddress, address payable CertisTokenProxyAddress, address payable PrivatePoolGeneratorProxyAddress) 
        isFromChairPerson()
        isNotInitialized()
    external
    {
        _init = true;
        //InternalUpdateContractsVersions(PublicPoolAddress, TreasuryProxyAddress, CertisTokenAddress, PrivatePoolGeneratorAddress, true);
        initProxies(PublicPoolProxyAddress, TreasuryProxyAddress, CertisTokenProxyAddress, PrivatePoolGeneratorProxyAddress);
    }

    // governance : contracts assignment and management
    function updateContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress, address PrivatePoolImplAddress) external
    {
        _ProposedContracts.NewPublicPoolAddress = PublicPoolAddress;
        _ProposedContracts.NewTreasuryAddress = TreasuryAddress;
        _ProposedContracts.NewCertisTokenAddress = CertisTokenAddress;
        _ProposedContracts.NewPrivatePoolGeneratorAddress = PrivatePoolGeneratorAddress;
        _ProposedContracts.NewPrivatePoolAddress = PrivatePoolImplAddress;
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
        upgradeContractsImplementations(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewPrivatePoolGeneratorAddress, _ProposedContracts.NewPrivatePoolAddress);
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

    function upgradeContractsImplementations(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress, address PrivatePoolImplAddress) internal
    {
        upgradeContractsImplementations(address(_PublicCertificatesPool), PublicPoolAddress);
        upgradeContractsImplementations(address(_Treasury), TreasuryAddress);
        upgradeContractsImplementations(address(_CertisToken), CertisTokenAddress);
        upgradeContractsImplementations(address(_PrivatePoolGenerator), PrivatePoolGeneratorAddress);

        _PrivatePoolGenerator.updatePrivateCertificatePoolImpl(PrivatePoolImplAddress);
    }

    function upgradeContractsImplementations(address AddressProxy, address AddressNewImpl) internal
    {
        bool success;
        (success, ) = AddressProxy.call(abi.encodeWithSignature("upgradeTo(address)", AddressNewImpl));
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
    /*function retrieveConfiguration() external view returns (address, address, address, address, address, uint) {
        return (address(_PublicCertificatesPool), address(_Treasury), address(_CertisToken), address(_PrivatePoolGenerator), _chairperson, address(this).balance);
    }*/

    function retrievePublicCertificatePoolProxy() external override view returns (address) {
        return (address(_PublicCertificatesPool));
    }

    function retrieveTreasuryProxy() external override view returns (address) {
        return (address(_Treasury));
    }

    function retrieveCertisTokenProxy() external override view returns (address) {
        return (address(_CertisToken));
    }

    function retrievePrivatePoolGeneratorProxy() external override view returns (address) {
        return (address(_PrivatePoolGenerator));
    }
    
}