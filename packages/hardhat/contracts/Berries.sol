// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IBerries.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Berries is IBerries, ERC20, ERC165, Ownable {

    // ========================================
    //     EVENT & ERROR DEFINITIONS
    // ========================================

    error NotController();

    // ========================================
    //     VARIABLE DEFINITIONS
    // ========================================

    modifier onlyController {
        if (!controllers[_msgSender()] && _msgSender() != owner()) revert NotController();
        _;
    }

    // controllers that can mint $BERRIES
    mapping (address => bool) controllers;

    // ========================================
    //    CONSTRUCTOR AND CORE FUNCTIONS
    // ========================================

    constructor() ERC20("BERRIES", "BERRIES") {}

    function mint(address _address, uint256 _amount) external onlyController {
        _mint(_address, _amount);
    }

    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }

    // ========================================
    //     ADMIN FUNCTIONS
    // ========================================

  function addController(address controller) external onlyOwner {
    controllers[controller] = true;
  }

  function removeController(address controller) external onlyOwner {
    controllers[controller] = false;
  }

    // ========================================
    //     OTHER FUNCTIONS
    // ========================================

    /**
     * @notice Returns if internface is supported
     * @dev ERC165
     */
    function supportsInterface(
        bytes4 _interfaceId
    ) public view override(ERC165) returns (bool) {
        return ERC165.supportsInterface(_interfaceId);
    }
}
