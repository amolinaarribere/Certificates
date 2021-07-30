// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import '../Interfaces/IPoolGenerator.sol';
 import "./PrivateCertificatesPool.sol";
 import "./Treasury.sol";
 import "../Libraries/Library.sol";
 import "../Base/ManagedBaseContract.sol";


contract PrivatePoolGenerator is IPoolGenerator, ManagedBaseContract {
    using Library for *;

     // EVENTS
    event _NewCertificatesPool(uint256, address, MultiSigCertificatesPool);

    // DATA
    // Private Certificates Pool structure
    struct _privateCertificatesPoolStruct{
        address _creator;
        PrivateCertificatesPool _PrivateCertificatesPool;
    } 

    _privateCertificatesPoolStruct[] _PrivateCertificatesPools;

    // Treasury
    Treasury _Treasury;

    // MODIFIERS
    modifier isIdCorrect(uint Id, uint length){
        require(true == Library.IdCorrect(Id, length), "EC1");
        _;
    }

    
    // CONSTRUCTOR
    constructor(address managerContractAddress)
    ManagedBaseContract(managerContractAddress) 
    {}

    // FUNCTIONALITY
    function updateContracts(address TreasuryAddress) external
        isFromManagerContract()
    {
        _Treasury = Treasury(TreasuryAddress);
    }


    function createPrivateCertificatesPool(address[] memory owners,  uint256 minOwners) external override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewPool);
        PrivateCertificatesPool certificatePool = new PrivateCertificatesPool(owners, minOwners);
        _privateCertificatesPoolStruct memory privateCertificatesPool = _privateCertificatesPoolStruct(msg.sender, certificatePool);
        _PrivateCertificatesPools.push(privateCertificatesPool);

        emit _NewCertificatesPool(_PrivateCertificatesPools.length - 1, privateCertificatesPool._creator, privateCertificatesPool._PrivateCertificatesPool);
    }

    function retrievePrivateCertificatesPool(uint certificatePoolId) external override
        isIdCorrect(certificatePoolId, _PrivateCertificatesPools.length)
    view returns (address, address)
    {
        return(_PrivateCertificatesPools[certificatePoolId]._creator, address(_PrivateCertificatesPools[certificatePoolId]._PrivateCertificatesPool));
    }

    function retrieveTotalPrivateCertificatesPool() external override view returns (uint)
    {
        return(_PrivateCertificatesPools.length);
    }

}