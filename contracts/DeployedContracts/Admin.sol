// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IAdmin.sol";
import "../Base/StdPropositionBaseContract.sol";
import "../Libraries/AddressLibrary.sol";
import "../Libraries/Library.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";


contract Admin is IAdmin, StdPropositionBaseContract{
    using AddressLibrary for *;
    using Library for *;

    // EVENTS /////////////////////////////////////////
    event _NewManager(address Manager);
    event _NewAdmin(address Admin);

    // DATA /////////////////////////////////////////
    // Manager
    TransparentUpgradeableProxy private _Manager;

    // Admin Proxy to manage the TransparentUpgradeableProxy
    ProxyAdmin private _Admin;

    // MODIFIERS /////////////////////////////////////////
    modifier areAddressesOK(address addr1, address addr2){
        require(address(0) != addr1 || address(0) != addr2, "EC21-");
        _;
    }

    // CONSTRUCTOR and INITIALIZATION /////////////////////////////////////////
    function Admin_init(string memory contractName, string memory contractVersion, address managerContract, bytes memory managerInit) public initializer 
    {
        _Admin = new ProxyAdmin();
        _Manager = new TransparentUpgradeableProxy(managerContract, address(_Admin), managerInit);
        super.StdPropositionBaseContract_init(msg.sender, address(_Manager), contractName, contractVersion);
    }

    function Admin_init_redeploy(string memory contractName, string memory contractVersion, address payable managerContractProxyAddress, address AdminProxyAddress) public initializer 
    {
        _Admin = ProxyAdmin(AdminProxyAddress);
        _Manager = TransparentUpgradeableProxy(managerContractProxyAddress);
        super.StdPropositionBaseContract_init(msg.sender, address(_Manager), contractName, contractVersion);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    // governance : contracts assignment and management
    function checkProposition(bytes[] memory NewValues) internal override 
        areAddressesOK(AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(NewValues[0])[0]), 
                        AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(NewValues[2])[0]))
    {}

    function UpdateAll() internal override
    {
        address NewImplAddress = AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(_ProposedNewValues[0])[0]);
        bytes memory Data = _ProposedNewValues[1];
        address NewAdminAddress = AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(_ProposedNewValues[2])[0]);

        if(address(0) != NewImplAddress){
            if(0 < Data.length)_Admin.upgradeAndCall(_Manager, NewImplAddress, Data);
            else _Admin.upgrade(_Manager, NewImplAddress);
            emit _NewManager(NewImplAddress);
        }
        
        if(address(0) != NewAdminAddress){
            _Admin.transferOwnership(NewAdminAddress);
            (bool success, bytes memory data) = address(_Manager).call(abi.encodeWithSignature("changeManagerAdmin(address)", NewAdminAddress));
            require(success, string(data));
            emit _NewAdmin(NewAdminAddress);
        }       

    }

    // configuration Proxies
    function retrieveAdminProxy() external override view returns (address) {
        return (address(_Admin));
    }

    function retrieveManagerProxy() external override view returns (address) {
        return (address(_Manager));
    }

    // configuration implementations
    function retrieveManager() external view override returns (address) {
        return _Admin.getProxyImplementation(_Manager);
    }
   
  
}