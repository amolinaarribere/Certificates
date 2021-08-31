// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IPriceConverter.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";


contract PriceConverter is Initializable, IPriceConverter {

    // DATA /////////////////////////////////////////
    FeedRegistryInterface internal registry;

    // CONSTRUCTOR /////////////////////////////////////////
    function PriceConverter_init(address _registry) public initializer {
        registry = FeedRegistryInterface(_registry);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function fromUSDToETH(uint _USDamount) external override view returns (uint) {
        (,int price,,,) = registry.latestRoundData(Denominations.ETH, Denominations.USD);
        return uint(price) * _USDamount;
    }

}