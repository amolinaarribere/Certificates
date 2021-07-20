// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Libraries/Library.sol";

 interface ITreasury  {

    function pay(Library.Prices price) external payable;

    function updateConfig(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address PublicPoolAddress, address CertisTokenAddress) external;
    function getRefund(address addr, uint numberOfOwners) external;
    function withdraw(uint amount) external;

    function retrieveBalance(address addr) external view returns(uint);
}