// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IGatherGambit.sol";
import "./IBerries.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

// ========================================
//
//     Enter, stranger, but take heed
//     Of what awaits the sin of greed,
//     For those who take, but do not earn,
//     Must pay most dearly in their turn.
//
// ========================================

/**
 * @title Berry Lands
 * @notice A part of Gather Gambit on-chain risk protocol,
 * @notice In Berry Lands, you collect $BERRIES!
 * @dev A contract for staking your Gather Gambit NFTs.
 */
contract BerryLands is Ownable {
    // ========================================
    //     EVENT & ERROR DEFINITIONS
    // ========================================

    event StakedInBerryLands(uint256 indexed tokenId, address indexed owner, Location indexed location);
    event UnstakedFromBerryLands(uint256 indexed tokenId, address indexed owner, Location indexed location);

    error NoPermission();
    error NotAGatherer();

    // ========================================
    //     VARIABLE DEFINITIONS
    // ========================================

    enum Location {
        FertileFields,
        WhisperingWoods
    }

    struct StakedAsset {
        uint128 tokenId; // The token ID of the staked token
        uint64 initBlock; // The block at which was this token staked
        address owner; // The owner of the token
        uint256 berries; // The amount of accumulated berries
    }

    IGatherGambit private _gambit;
    IBerries private _berries;

    mapping(uint256 => StakedAsset) private _stakedInFertileFields;
    mapping(uint256 => StakedAsset) private _stakedInWhisperingWoods;

    // ========================================
    //    CONSTRUCTOR AND CORE FUNCTIONS
    // ========================================

    constructor(address _gambitAddress, address _berriesAddress) {
        _gambit = IGatherGambit(_gambitAddress);
        _berries = IBerries(_berriesAddress);
    }

    /**
     * @notice Stakes a token in the Fertile Fields.
     * @param _tokenId The token ID to stake.
     */
    function enterBerryLands(uint256 _tokenId, Location _location) external {
        if (_gambit.getEntity(_tokenId) != IGatherGambit.Entity.Gatherer) revert NotAGatherer();

        if (_location == Location.FertileFields) {
            if (_stakedInFertileFields[_tokenId].owner != address(0)) revert NoPermission();

            _gambit.transferFrom(msg.sender, address(this), _tokenId);
            _stakedInFertileFields[_tokenId] = StakedAsset({
                tokenId: uint128(_tokenId),
                initBlock: uint64(block.number),
                owner: msg.sender,
                berries: 0
            });

            emit StakedInBerryLands(_tokenId, msg.sender, Location.FertileFields);
        } else if (_location == Location.WhisperingWoods) {
            if (_stakedInWhisperingWoods[_tokenId].owner != address(0)) revert NoPermission();

            _gambit.transferFrom(msg.sender, address(this), _tokenId);
            _stakedInWhisperingWoods[_tokenId] = StakedAsset({
                tokenId: uint128(_tokenId),
                initBlock: uint64(block.number),
                owner: msg.sender,
                berries: 0
            });

            emit StakedInBerryLands(_tokenId, msg.sender, Location.WhisperingWoods);
        }
    }

    /**
     * @notice Unstakes a token from Berry Lands and claims $BERRIES.
     * @param _tokenId The token ID to unstake.
     * @param _location The location of where the token is staked.
     */
    function exitBerryLands(uint256 _tokenId, Location _location) external {
        if (_location == Location.FertileFields) {
            StakedAsset memory stakedAsset = _stakedInFertileFields[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 claimableBerries = getClaimableBerries(_tokenId, _location);
            _berries.mint(msg.sender, claimableBerries);

            delete _stakedInFertileFields[_tokenId];
            _gambit.transferFrom(address(this), msg.sender, _tokenId);

            emit UnstakedFromBerryLands(_tokenId, msg.sender, Location.FertileFields);
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 claimableBerries = getClaimableBerries(_tokenId, _location);
            _berries.mint(msg.sender, claimableBerries);

            delete _stakedInWhisperingWoods[_tokenId];
            _gambit.transferFrom(address(this), msg.sender, _tokenId);

            emit UnstakedFromBerryLands(_tokenId, msg.sender, Location.WhisperingWoods);
        }
    }

    // ========================================
    //     ADMIN FUNCTIONS
    // ========================================

    // ========================================
    //     GETTER FUNCTIONS
    // ========================================

    function getClaimableBerries(
        uint256 _tokenId,
        Location _location
    ) public view returns (uint256) {
        uint256 claimable;
        if (_location == Location.FertileFields) {
            StakedAsset memory stakedAsset = _stakedInFertileFields[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 DAILY_FERTILE_FIELDS_RATE = 1000;
            claimable =
                ((block.timestamp - stakedAsset.initBlock) *
                    DAILY_FERTILE_FIELDS_RATE) /
                1 days;
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 DAILY_WHISPERING_WOODS_RATE = 5000;
            claimable =
                ((block.timestamp - stakedAsset.initBlock) *
                    DAILY_WHISPERING_WOODS_RATE) /
                1 days;
        }

        return claimable;
    }

    /**
     * @notice Returns the address of the Gather Gambit contract
     */
    function getGambitContract() external view returns (address) {
        return address(_gambit);
    }

    /**
     * @notice Returns the address of the Berry contract
     */
    function getBerriesContract() external view returns (address) {
        return address(_berries);
    }

    // ========================================
    //     OTHER FUNCTIONS
    // ========================================
}
