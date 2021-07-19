// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface ITreasury  {
    function payForNewProposal() external payable;
    function payForNewPool() external payable;
    function payForNewCertificate() external payable;

    function updateConfig(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address PublicPoolAddress) external;
    function getRefund(address addr, uint numberOfOwners) external;
    function withdraw(uint amount) external;

    function retrieveBalance(address addr) external view returns(uint);
}