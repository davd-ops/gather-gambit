// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "./IGatherGambit.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Base64.sol";
import "./Images.sol";
import "hardhat/console.sol";

/**
 * @title Gather Gambit
 * @notice Fully on-chain risk protocol full of game theory and NFTs!
 * @dev A contract for minting Gather Gambit NFTs.
 */
contract GatherGambit is IGatherGambit, ERC721A, Ownable {
    using Strings for uint256;

    // ========================================
    //     EVENT & ERROR DEFINITIONS
    // ========================================

    error QueryForNonexistentToken();
    error OnlyReproductionContractCanMint();

    // ========================================
    //     VARIABLE DEFINITIONS
    // ========================================

    uint256 private _epochIndex; // The current epoch index
    address private _reproductionContract; // The address of the reproduction contract

    mapping(uint256 => uint256) epochPerToken; // The epoch index of each token
    mapping(uint256 => Epoch) epochPerEpochIndex; // The epoch per each epoch index

    // ========================================
    //    CONSTRUCTOR AND CORE FUNCTIONS
    // ========================================

    constructor() ERC721A("Gather Gambit", "GAMBIT") {

    }

    /**
     * @notice Mints a token.
     * @notice First 1000 are for anyone, after that only the reproduction contract can mint.
     * @param _address The address to mint the token to.
     */
    function mint(address _address) external {
        if (_nextTokenId() > 1000 && msg.sender != _reproductionContract) revert OnlyReproductionContractCanMint();
        resolveEpochIfNecessary();

        uint256 intialTokenId = _nextTokenId();
        uint256 nextTokenId = intialTokenId;

        epochPerToken[nextTokenId] = _epochIndex;

        _mint(_address, 1);
    }

    /**
     * @notice Burns a token.
     * @param _tokenId The ID of the token to burn.
     */
    function burn(uint256 _tokenId) public {
        _burn(_tokenId, true);
    }

    /**
     * @notice Burns multiple tokens at once.
     * @dev This is a gas-efficient way to burn multiple tokens at once.
     * @param _tokenIds The IDs of the tokens to burn.
     */
    function burnBatch(uint256[] calldata _tokenIds) public {
        for (uint i = 0; i < _tokenIds.length; ) {
            _burn(_tokenIds[i], true);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Returns the metadata of a token.
     * @param _tokenId The ID of the token to query.
     * @return The metadata of the token, encoded as base64.
     * @dev The image is also encoded as separate base64
     */
    function tokenURI(
        uint256 _tokenId
    ) public view override(ERC721A, IGatherGambit) returns (string memory) {
        if (!_exists(_tokenId)) revert QueryForNonexistentToken();
        Entity entity = getEntity(_tokenId);
        string memory metadata;

        if (entity == Entity.Unrevealed) {
            metadata = string(
                abi.encodePacked(
                    '{"name": "',
                    "Unrevealed #",
                    _tokenId.toString(),
                    '", "description": "Gather Gambit game.", "image": "data:image/svg+xml;base64,',
                    Base64.base64(bytes(Images.UNREVEALED)),
                    '"}'
                )
            );
        } else if (entity == Entity.Gatherer) {
            metadata = string(
                abi.encodePacked(
                    '{"name": "',
                    "Gatherer #",
                    _tokenId.toString(),
                    '", "description": "Gather Gambit game.", "image": "data:image/svg+xml;base64,',
                    Base64.base64(bytes(Images.GATHERER)),
                    '"}'
                )
            );
        } else if (entity == Entity.Protector) {
            metadata = string(
                abi.encodePacked(
                    '{"name": "',
                    "Protector #",
                    _tokenId.toString(),
                    '", "description": "Gather Gambit game.", "image": "data:image/svg+xml;base64,',
                    Base64.base64(bytes(Images.PROTECTOR)),
                    '"}'
                )
            );
        } else if (entity == Entity.Wolf) {
            metadata = string(
                abi.encodePacked(
                    '{"name": "',
                    "Wolf #",
                    _tokenId.toString(),
                    '", "description": "Gather Gambit game.", "image": "data:image/svg+xml;base64,',
                    Base64.base64(bytes(Images.WOLF)),
                    '"}'
                )
            );
        }

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.base64(bytes(metadata))
                )
            );
    }

    // ========================================
    //     ADMIN FUNCTIONS
    // ========================================

    /**
     * @notice Sets the reproduction contract address.
     * @param _reproductionContractAddress The address of the reproduction contract.
     */
    function setReproductionContract(
        address _reproductionContractAddress
    ) external onlyOwner {
        _reproductionContract = _reproductionContractAddress;
    }

    // ========================================
    //     GETTER FUNCTIONS
    // ========================================

    /**
     * @notice Returns the reproduction contract address.
     */
    function getReproductionContract() external view returns (address) {
        return _reproductionContract;
    }

    /**
     * @notice Returns the current epoch index.
     */
    function getCurrentEpochIndex() external view returns (uint256) {
        return _epochIndex;
    }

    /**
     * @notice Returns the epoch data of _epoch.
     * @param _epochId The ID of the epoch to query.
     */
    function getEpoch(uint256 _epochId) external view returns (Epoch memory) {
        return epochPerEpochIndex[_epochId];
    }

    /**
     * @notice Returns the epoch index of a token.
     * @param _tokenId The ID of the token to query.
     */
    function getEntity(uint256 _tokenId) public view returns (Entity) {
        if (!_exists(_tokenId)) revert QueryForNonexistentToken();

        if (!epochPerEpochIndex[epochPerToken[_tokenId]].resolved) {
            return Entity.Unrevealed;
        }

        // get random number from resolved epoch
        uint256 entityRange = (uint256(
            keccak256(
                abi.encodePacked(
                    epochPerEpochIndex[epochPerToken[_tokenId]].randomness
                )
            )
        ) % 100) + 1;
        // 80% chance of Gatherer
        if (entityRange < 80) {
            return Entity.Gatherer;
        }
        // 5% chance of Protector
        else if (entityRange < 85) {
            return Entity.Protector;
        }
        // 15% chance of Wolf
        else {
            return Entity.Wolf;
        }
    }

    // ========================================
    //     OTHER FUNCTIONS
    // ========================================

    /**
     * @notice Initializes and closes epochs.
     * @dev Based on the commit-reveal scheme by MouseDev.
     */
    function resolveEpochIfNecessary() public {
        Epoch storage currentEpoch = epochPerEpochIndex[_epochIndex];
        if (
            // If epoch has not been committed,
            currentEpoch.committed == false ||
            // Or the reveal commitment timed out.
            (currentEpoch.resolved == false &&
                currentEpoch.revealBlock < block.number - 256)
        ) {
            // This means the epoch has not been committed, OR the epoch was committed but has expired.
            // Set committed to true, and record the reveal block:
            currentEpoch.revealBlock = uint64(block.number + 50);
            currentEpoch.committed = true;
        } else if (block.number > currentEpoch.revealBlock) {
            // Epoch has been committed and is within range to be resolved.
            // Set its randomness to the target block hash.
            currentEpoch.randomness = uint128(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            blockhash(currentEpoch.revealBlock),
                            block.prevrandao
                        )
                    )
                ) % (2 ** 128 - 1)
            );
            currentEpoch.resolved = true;

            // Notify DAPPs about the new epoch.
            emit NewEpoch(_epochIndex, currentEpoch.revealBlock);

            // Initialize the next epoch
            _epochIndex++;
            resolveEpochIfNecessary();
        }
    }

    /**
     * @dev Override to start with token ID 1.
     */
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}