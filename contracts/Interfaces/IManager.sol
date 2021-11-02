// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 import "../Libraries/Library.sol";

 interface IManager  {
    function InitializeContracts(Library.ProposedContractsStruct calldata initialContracts) external;
    function ChangeAdminOwner(address newOwner) external;
    
    function retrievePublicCertificatePoolProxy() external view returns (address);
    function retrieveTreasuryProxy() external view returns (address);
    function retrieveCertisTokenProxy() external view returns (address);
    function retrievePrivatePoolFactoryProxy() external view returns (address);
    function retrievePrivatePoolBeacon() external view returns (address);
    function retrieveProviderFactoryProxy() external view returns (address);
    function retrieveProviderBeacon() external view returns (address);
    function retrievePriceConverterProxy() external view returns (address);
    function retrievePropositionSettingsProxy() external view returns (address);
    function retrieveENSProxy() external view returns (address);

    function retrievePublicCertificatePool() external view returns (address);
    function retrieveTreasury() external view returns (address);
    function retrieveCertisToken() external view returns (address);
    function retrievePrivatePoolFactory() external view returns (address);
    function retrievePrivatePool() external view returns (address);
    function retrieveProviderFactory() external view returns (address);
    function retrieveProvider() external view returns (address);
    function retrievePriceConverter() external view returns (address);
    function retrievePropositionSettings() external view returns (address);
    function retrieveENS() external view returns (address);

    function isInitialized() external view returns(bool);
}