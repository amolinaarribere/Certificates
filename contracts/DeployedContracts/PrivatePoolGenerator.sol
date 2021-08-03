// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import '../Interfaces/IPoolGenerator.sol';
 import "./PrivateCertificatesPool.sol";
 import "./Proxies/PrivateCertificatesPoolProxy.sol";
 import "./Treasury.sol";
 import "../Libraries/Library.sol";
 import "../Base/ManagedBaseContract.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
 import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";


contract PrivatePoolGenerator is IPoolGenerator, Initializable, ManagedBaseContract{
    using Library for *;

     // EVENTS
    event _NewCertificatesPool(uint256, address, address);

    // DATA
    // Private Certificate Pool implementation
    UpgradeableBeacon _PrivateCertificatePoolBeacon;

    // Private Certificates Pool structure
    struct _privateCertificatesPoolStruct{
        address _creator;
        address _PrivateCertificatesPoolProxyAddress;
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
    /*constructor(address managerContractAddress)
    ManagedBaseContract(managerContractAddress) 
    {}*/

    function PrivatePoolGenerator_init(address managerContractAddress, address PrivateCertificatePoolImplAddress) public initializer {
        super.ManagedBaseContract_init(managerContractAddress);
        _PrivateCertificatePoolBeacon = new UpgradeableBeacon(PrivateCertificatePoolImplAddress);
    }

    // FUNCTIONALITY
    function updateContracts(address TreasuryAddressProxy) external
        isFromManagerContract()
    {
        _Treasury = Treasury(TreasuryAddressProxy);
    }

    function updatePrivateCertificatePoolImpl(address PrivateCertificatePoolImplAddress) external
        isFromManagerContract()
    {
        _PrivateCertificatePoolBeacon.upgradeTo(PrivateCertificatePoolImplAddress);
    }

    function createPrivateCertificatesPool(address[] memory owners,  uint256 minOwners) external override payable
    {
        _Treasury.pay{value:msg.value}(Library.Prices.NewPool);
        bytes memory data = abi.encodeWithSignature("PrivateCertPool_init(address[],uint256)", owners, minOwners);
        PrivateCertificatesPoolProxy certificatePoolProxy = new PrivateCertificatesPoolProxy(address(_PrivateCertificatePoolBeacon), data);
        _privateCertificatesPoolStruct memory privateCertificatesPool = _privateCertificatesPoolStruct(msg.sender, address(certificatePoolProxy));
        _PrivateCertificatesPools.push(privateCertificatesPool);

        emit _NewCertificatesPool(_PrivateCertificatesPools.length - 1, privateCertificatesPool._creator, privateCertificatesPool._PrivateCertificatesPoolProxyAddress);
    }

    function retrievePrivateCertificatesPool(uint certificatePoolId) external override
        isIdCorrect(certificatePoolId, _PrivateCertificatesPools.length)
    view returns (address, address)
    {
        return(_PrivateCertificatesPools[certificatePoolId]._creator, _PrivateCertificatesPools[certificatePoolId]._PrivateCertificatesPoolProxyAddress);
    }

    function retrieveTotalPrivateCertificatesPool() external override view returns (uint)
    {
        return(_PrivateCertificatesPools.length);
    }

}