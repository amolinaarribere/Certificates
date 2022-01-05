// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

// ropsten address : 0x6F628b68b30Dc3c17f345c9dbBb1E483c2b7aE5c

interface IENSReverseRegistry {
    function claim(address owner) external returns (bytes32);
    function claimWithResolver(address owner, address resolver) external returns (bytes32);
    function setName(string memory name) external returns (bytes32);
    function node(address addr) external pure returns (bytes32);
    function getDefaultResolver() external view returns (address);
}