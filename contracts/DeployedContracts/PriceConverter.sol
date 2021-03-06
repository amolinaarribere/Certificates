// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Price Converter is an interface to the Chain Link Price Registry for USD to ETH exchange
 */

import "../Interfaces/IPriceConverter.sol";
import "../Base/StdPropositionBaseContract.sol";
import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";


contract PriceConverter is IPriceConverter, StdPropositionBaseContract {

    // EVENTS /////////////////////////////////////////
    event _NewRegistryAddress(address Registry);

    // DATA /////////////////////////////////////////
    FeedRegistryInterface internal _registry;
    uint8 constant _ETHDecimals = 18;
    uint8 constant _USDDecimals = 2;

    // MODIFIERS /////////////////////////////////////////
    modifier isAddressOK(address addr){
        require(address(0) != addr, "EC21-");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function PriceConverter_init(address registry, address managerContractAddress, address chairPerson, string memory contractName, string memory contractVersion) public initializer 
    {
        super.StdPropositionBaseContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        _registry = FeedRegistryInterface(registry);
    }

    // GOVERNANCE /////////////////////////////////////////
    function checkProposition(bytes[] memory NewValues) internal override 
        isAddressOK(AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(NewValues[0])[0]))
    {}

    function UpdateAll() internal override
    {
        bytes32[] memory ProposedNewValues = PropositionsToBytes32();
        address NewRegistryAddress = AddressLibrary.Bytes32ToAddress(ProposedNewValues[0]);
        _registry = FeedRegistryInterface(NewRegistryAddress);
        emit _NewRegistryAddress(NewRegistryAddress);
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

    function retrieveSettings() external override view returns(address)
    {
        return address(_registry);
    }

}