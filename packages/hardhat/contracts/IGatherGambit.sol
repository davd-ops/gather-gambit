// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "erc721a/contracts/IERC721A.sol";

interface IGatherGambit is IERC721A {
    event NewEpoch(uint256 indexed epochId, uint256 indexed revealBlock);

    enum Entity {
        Unrevealed,
        Gatherer,
        Protector,
        Wolf
    }

    struct Epoch {
        uint128 randomness; // The source of randomness for tokens from this epoch
        uint64 revealBlock; // The block at which this epoch was / is revealed
        bool committed; // Whether the epoch has been instantiated
        bool resolved; // Whether the epoch has been resolved
    }

    function mint(address _address, uint256 _amount) external;

    function burn(uint256 _tokenId) external;

    function burnBatch(uint256[] calldata _tokenIds) external;

    function tokenURI(uint256 _tokenId) external view returns (string memory);

    function resolveEpochIfNecessary () external;

    function setStakingContract(address _stakingContractAddress) external;

    function getStakingContract() external view returns (address);

    function getCurrentEpochIndex() external view returns (uint256);

    function getEpoch(uint256 _epochId) external view returns (Epoch memory);

    function getEntity(uint256 _tokenId) external view returns (Entity);
}
