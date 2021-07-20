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

     // events
    event _SendProposalId(address);

     address _creator;
     mapping(address => bool) _submited;
     Treasury _Treasury;

     //modifiers
    modifier hasBeenSubmitted(bool YesOrNo, address provider){
        if(false == YesOrNo) require(false == _submited[provider], "EC3");
        else require(true == _submited[provider], "EC4");
        _;
    }

     // Constructor
    constructor(address[] memory owners,  uint256 minOwners, address managerContractAddress) MultiSigCertificatesPool(owners, minOwners) payable {
        _creator = managerContractAddress;
    }

    function addProvider(address provider, string memory providerInfo) external 
        hasBeenSubmitted(false, provider)
    override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewProvider);
        _Entities[_providerId]._entities[provider]._Info = providerInfo;
        _submited[provider] = true;

        emit _SendProposalId(provider);
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

       if(false == isEntity(provider, _providerId)){
            delete(_submited[provider]);
       }
    }

    function addTreasury(address TreasuryAddress) external
        isSomeoneSpecific(_creator)
    {
        _Treasury = Treasury(TreasuryAddress);
    }

    function addCertificate(bytes32 CertificateHash, address holder) external override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewCertificate);
        addCertificateInternal(CertificateHash, holder);
    }

 }