// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */


contract MockChainLinkFeedRegistry {
    int256 constant factor = 1000;

    function latestRoundData(address base,address quote)external pure
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
    {
        return (0, factor, 0, 0, 0);
    }

}