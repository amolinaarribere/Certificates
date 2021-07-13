// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Abstract/MultiSigCertificatesPool.sol";

 contract PublicCertificatesPool is MultiSigCertificatesPool {

     address _creator;
     mapping(address => bool) _submitedByCreator;

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

    function addProvider(address provider, string memory providerInfo, uint nonce) external 
        isSomeoneSpecific(_creator)
        hasBeenSubmitted(false, provider)
        isNonceOK(nonce)
    override
    {
        _Entities[_providerId]._entities[provider]._Info = bytes(providerInfo);
        _submitedByCreator[provider] = true;
        _Nonces._noncesPerAddress[msg.sender][nonce] = true;
    }

    function validateProvider(address provider, uint nonce) external 
        hasBeenSubmitted(true, provider)
    {
        addEntity(provider, _Entities[_providerId]._entities[provider]._Info, _providerId, nonce);
    }

    function removeProvider(address provider, uint nonce) external override{
       removeEntity(provider, _providerId, nonce); 

       if(false == Library.isEntity(_Entities[_providerId]._entities[provider])){
            delete(_submitedByCreator[provider]);
       }
    }

 }