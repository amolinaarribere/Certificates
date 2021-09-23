// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Price Converter is an interface to the Chain Link Price Registry for USD to ETH exchange
 */

import "../Interfaces/IPriceConverter.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";


contract PriceConverter is IPriceConverter, TokenGovernanceBaseContract {

     // EVENTS /////////////////////////////////////////
    event _NewRegistryAddress(address Registry);

    // DATA /////////////////////////////////////////
    FeedRegistryInterface internal _registry;
    uint8 constant _ETHDecimals = 18;
    uint8 constant _USDDecimals = 2;

    address internal _ProposedRegistryAddress;

    // CONSTRUCTOR /////////////////////////////////////////
    function PriceConverter_init(address registry, address managerContractAddress, address chairPerson, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) public initializer 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, chairPerson, managerContractAddress);
        _registry = FeedRegistryInterface(registry);
    }

    // GOVERNANCE /////////////////////////////////////////
    function updateRegistryAddress(address NewRegistryAddress) external override
    {
        addProposition();
        _ProposedRegistryAddress = NewRegistryAddress;
    }

    function propositionApproved() internal override
    {
        _registry = FeedRegistryInterface(_ProposedRegistryAddress);
        
        removeProposition();

        emit _NewRegistryAddress(_ProposedRegistryAddress);
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
         delete(_ProposedRegistryAddress);
    }

    function retrieveProposition() external override view returns(bytes32[] memory)
    {
        bytes32[] memory proposition = new bytes32[](1);
        proposition[0] = AddressLibrary.AddressToBytes32(_ProposedRegistryAddress);
        return proposition;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function fromUSDToETH(uint _USDamount) external override view returns (uint) {
        uint8 decimals = _registry.decimals(Denominations.ETH, Denominations.USD);
        (,int price,,,) = _registry.latestRoundData(Denominations.ETH, Denominations.USD);

        uint256 amount = 10**(decimals + _ETHDecimals - _USDDecimals) * _USDamount / uint(price);
        uint256 remainder = 10**(decimals + _ETHDecimals - _USDDecimals) * _USDamount % uint(price);

        if(remainder > 0) amount += 1;

        return amount;
    }

    function retrieveRegistryAddress() external override view returns(address){
        return address(_registry);
    }

}