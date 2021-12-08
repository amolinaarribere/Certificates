// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

interface IENSResolver {
    function addr(bytes32 node) external view returns (address);
    function setAddr(bytes32 node, address addr) external;
}