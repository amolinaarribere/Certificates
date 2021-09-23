// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Mock Contract simulating the ChainLink Feed Registry ETH <-> USD for the tests chains that do not include it
 */


contract MockChainLinkFeedRegistry {
    int256 factor;
    uint8 decimalsValue;

    constructor(int256 _factor, uint8 _decimals){
        factor = _factor;
        decimalsValue = _decimals;
    }

    function latestRoundData(address base,address quote)external view
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

    function decimals(address base, address quote) external view returns (uint8){
        return decimalsValue;
    }

}