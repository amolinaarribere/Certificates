// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./CertificatesPool.sol";

 /* 
 Like Private Certificates except that Providers must be sent from "Creator" who is not an owner
 */

 contract PublicCertificatesPool is CertificatesPool {

     address _creator;
     mapping(address => bool) _submitedByCreator;

     //modifiers
    modifier hasBeenSubmitted(bool YesOrNo, address provider){
        if(false == YesOrNo) require(false == _submitedByCreator[provider], "Provider already activated or in progress");
        else require(true == _submitedByCreator[provider], "Provider not submited by Creator yet");
        _;
    }

     // Constructor
    constructor(address[] memory owners,  uint256 minOwners) CertificatesPool(owners, minOwners) payable {
        _creator = msg.sender;
    }

    function addProvider(address provider, string memory providerInfo) external 
        isSomeoneSpecific(_creator)
        hasBeenSubmitted(false, provider)
    override
    {
        _certificateEntities[_providerId]._entities[provider]._Info = providerInfo;
        _submitedByCreator[provider] = true;
    }

    function validateProvider(address provider) external 
        hasBeenSubmitted(true, provider)
        isAnOwner 
        isEntityActivated(false, provider, _providerId) 
        OwnerhasNotAlreadyVoted(Actions.Add, provider)
    {
        _certificateEntities[_providerId]._entities[provider]._addValidations += 1;
        _certificateEntities[_providerId]._entities[provider]._AddValidated[msg.sender] = true;

        if(CheckValidations(_certificateEntities[_providerId]._entities[provider]._addValidations)){
            _certificateEntities[_providerId]._entities[provider]._activated = true;
            _certificateEntities[_providerId]._entities[provider]._id = _certificateEntities[_providerId]._activatedEntities.length;
            _certificateEntities[_providerId]._activatedEntities.push(provider);
            _numberOfEntities[_providerId] += 1;

            emit _AddEntityValidationIdEvent(_entitiesLabel[_providerId] ,provider);
        }

    }

 }