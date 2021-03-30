// SPDX-License-Identifier: MIT
pragma solidity 0.8.3;

interface IDropFactory {
    function createDrop(address tokenAddress) external;

    function addDropData(
        uint256 tokenAmount,
        uint256 deadline,
        bytes32 merkleRoot,
        address tokenAddress
    ) external;

    function claimFromDrop(
        address tokenAddress,
        uint256 index,
        uint256 amount,
        bytes32 merkleRoot,
        bytes32[] calldata merkleProof
    ) external;

    function multipleClaimsFromDrop(
        address tokenAddress,
        uint256[] calldata indexes,
        uint256[] calldata amounts,
        bytes32[] calldata merkleRoots,
        bytes32[][] calldata merkleProofs
    ) external;

    function withdrawFromDropAfterDeadline(address tokenAddress, bytes32 merkleRoot) external;

    function isDropClaimed(
        address tokenAddress,
        uint256 index,
        bytes32 merkleRoot
    ) external view returns (bool);

    event DropCreated(address indexed dropAddress, address indexed tokenAddress);
    event DropClaimed(address indexed tokenAddress, uint256 index, address indexed account, uint256 amount, bytes32 indexed merkleRoot);
    event DropWithdrawn(address indexed tokenAddress, address indexed account, bytes32 indexed merkleRoot, uint256 amount);
}
