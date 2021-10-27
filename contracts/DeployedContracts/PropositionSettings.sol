// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
  Events : 
    - New Settings Added : list of settings
 */

import "../Interfaces/IPropositionSettings.sol";
import "../Libraries/UintLibrary.sol";
import "../Base/TokenGovernanceBaseContract.sol";

contract PropositionSettings is IPropositionSettings, TokenGovernanceBaseContract{
    using UintLibrary for *;

    // EVENTS /////////////////////////////////////////
    event _NewSettings(uint256 LifeTime, uint8 ThresholdPercentage, uint8 minWeightToProposePercentage);

    // DATA /////////////////////////////////////////
    uint256 internal _LifeTime;
    uint8 internal _ThresholdPerc;
    uint8 internal _minWeightToProposePerc;

    // proposition to change prices
    struct ProposedSettingsStruct{
        uint256 NewLifeTime;
        uint8 NewThresholdPerc;
        uint8 NewMinWeightToProposePerc;
    }

    ProposedSettingsStruct internal _ProposedSettings;

    // MODIFIERS /////////////////////////////////////////
    modifier areSettingsOK(uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage){
        require(100 >= PropositionThresholdPercentage, "EC21-");
        require(100 >= minWeightToProposePercentage, "EC21-");
        _;
    }
    
    // CONSTRUCTOR /////////////////////////////////////////
    function PropositionSettings_init(address managerContractAddress, address chairPerson, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage, string memory contractName, string memory contractVersion) public initializer 
    {
        super.TokenGovernanceContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        InternalupdateSettings(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, true);
    }

    // GOVERNANCE /////////////////////////////////////////
    function updateSettings(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) external override
    {
        InternalupdateSettings(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, false);
    }

    function InternalupdateSettings(uint256 PropLifeTime, uint8 PropThresholdPerc, uint8 minWeightToPropPerc, bool fromConstructor) internal
        areSettingsOK(PropThresholdPerc, minWeightToPropPerc)
    {
        if(fromConstructor){
            _LifeTime = PropLifeTime;
            _ThresholdPerc = PropThresholdPerc;
            _minWeightToProposePerc = minWeightToPropPerc;
        }
        else{
            addProposition();
            _ProposedSettings.NewLifeTime = PropLifeTime;
            _ProposedSettings.NewThresholdPerc = PropThresholdPerc;
            _ProposedSettings.NewMinWeightToProposePerc = minWeightToPropPerc;
        }   
        
    }

    function propositionApproved() internal override
    {
        _LifeTime = _ProposedSettings.NewLifeTime;
        _ThresholdPerc = _ProposedSettings.NewThresholdPerc;
        _minWeightToProposePerc = _ProposedSettings.NewMinWeightToProposePerc;
        
        removeProposition();

        emit _NewSettings(_LifeTime, _ThresholdPerc, _minWeightToProposePerc);
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
         delete(_ProposedSettings);
    }

    function retrieveProposition() external override view returns(bytes32[] memory)
    {
        bytes32[] memory proposition = new bytes32[](3);
        proposition[0] = UintLibrary.UintToBytes32(_ProposedSettings.NewLifeTime);
        proposition[1] = UintLibrary.UintToBytes32(_ProposedSettings.NewThresholdPerc);
        proposition[2] = UintLibrary.UintToBytes32(_ProposedSettings.NewMinWeightToProposePerc);
        return proposition;
    }

    function retrieveSettings() external override view returns(uint256, uint8, uint8)
    {
        return(_LifeTime, _ThresholdPerc, _minWeightToProposePerc);
    }


}