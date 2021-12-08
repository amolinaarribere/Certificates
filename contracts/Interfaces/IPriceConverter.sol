// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IPriceConverter  {

    function fromUSDToETH(uint) external view returns(uint);
    function retrieveSettings() external view returns(address);

}