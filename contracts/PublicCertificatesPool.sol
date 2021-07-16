// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Abstract/MultiSigCertificatesPool.sol";
 import "./Interfaces/IPublicPool.sol";
 import "./Treasury.sol";

 contract PublicCertificatesPool is MultiSigCertificatesPool, IPublicPool {

     address _creator;
     mapping(address => bool) _submitedByCreator;
     Treasury _Treasury;

     //modifiers
    modifier hasBeenSubmitted(bool YesOrNo, address provider){
        if(false == YesOrNo) require(false == _submitedByCreator[provider], "EC3");
        else require(true == _submitedByCreator[provider], "EC4");
        _;
    }

     // Constructor
    constructor(address[] memory owners,  uint256 minOwners) MultiSigCertificatesPool(owners, minOwners) payable {
        _creator = msg.sender;
    }

    function addProvider(address provider, string memory providerInfo) external 
        isSomeoneSpecific(_creator)
        hasBeenSubmitted(false, provider)
    override
    {
        _Entities[_providerId]._entities[provider]._Info = providerInfo;
        _submitedByCreator[provider] = true;
    }

    function validateProvider(address provider) external 
        hasBeenSubmitted(true, provider)
    override
    {
        addEntity(provider, _Entities[_providerId]._entities[provider]._Info, _providerId);

        if(true == isProvider(provider)){
            uint totalValidators = _Entities[_providerId]._entities[provider]._AddValidated.length;

            for(uint i=0; i < totalValidators; i++){
                _Treasury.getRefund(_Entities[_providerId]._entities[provider]._AddValidated[i], totalValidators);
            }
        }
    }

    function removeProvider(address provider) external override{
       removeEntity(provider, _providerId); 

       if(false == Library.isEntity(_Entities[_providerId]._entities[provider])){
            delete(_submitedByCreator[provider]);
       }
    }

    function addTreasury(address TreasuryAddress) external
        isSomeoneSpecific(_creator)
    {
        _Treasury = Treasury(TreasuryAddress);
    }

 }