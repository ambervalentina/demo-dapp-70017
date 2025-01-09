// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {console, stdStorage, StdStorage, Test} from "forge-std/Test.sol";
import "forge-std/Vm.sol";
import {Utilities} from "./utils/Utilities.sol";
import {IERC20Errors} from "./utils/draft-IERC6093.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import {Cinnamonroll} from "../contracts/Cinnamonroll.sol";

// Ownership test
contract OwnerTest is Test {
    Cinnamonroll cinnamonroll;
    address owner = address(0x123);
    address nonOwner = address(0x456);

    function setUp() public {
        vm.prank(owner);
        cinnamonroll = new Cinnamonroll();
    }

    function testBalanceOfNonExistentAccount() public view {
        address nonExistent = address(0xdead);
        uint256 balance = cinnamonroll.balanceOf(nonExistent);
        assertEq(balance, 0, "Balance of a non-existent account should be zero");
    }

    function testOwnerCanMint() public {
        vm.prank(owner);
        cinnamonroll.mint(owner, 100 * (10 ** 18));
        assertEq(cinnamonroll.balanceOf(owner), 200 * (10 ** 18));
    }

    function testNonOwnerCannotMint() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        cinnamonroll.mint(nonOwner, 100 * (10 ** 18));
    }
}

// Transfer tests
contract BaseSetup is Cinnamonroll, Test {
    Utilities internal utils;
    address payable[] internal users;

    address internal alice;
    address internal bob;

    function setUp() public virtual {
        utils = new Utilities();
        users = utils.createUsers(5);

        alice = users[0];
        vm.label(alice, "Alice");
        bob = users[1];
        vm.label(bob, "Bob");
    }
}

contract WhenTransferringTokens is BaseSetup {
    uint256 internal maxTransferAmount = 12e18;

    function setUp() public virtual override {
        BaseSetup.setUp();
        console.log("When transferring tokens");
    }

    function transferToken(address from, address to, uint256 transferAmount) public returns (bool) {
        vm.prank(from);
        return this.transfer(to, transferAmount);
    }
}

contract WhenAliceHasSufficientFunds is WhenTransferringTokens {
    uint256 internal mintAmount = maxTransferAmount;

    function setUp() public override {
        WhenTransferringTokens.setUp();
        console.log("When Alice has sufficient funds");
        _mint(alice, mintAmount);
    }

    function itTransfersAmountCorrectly(address from, address to, uint256 amount) public {
        uint256 fromBalance = balanceOf(from);
        bool success = transferToken(from, to, amount);

        assertTrue(success);
        assertEqDecimal(balanceOf(from), fromBalance - amount, decimals());
        assertEqDecimal(balanceOf(to), amount, decimals());
    }

    function testTransferAllTokens() public {
        uint256 t = maxTransferAmount;
        itTransfersAmountCorrectly(alice, bob, t);
    }

    function testTransferHalfTokens() public {
        uint256 t = maxTransferAmount / 2;
        itTransfersAmountCorrectly(alice, bob, t);
    }

    function testTransferOneToken() public {
        itTransfersAmountCorrectly(alice, bob, 1);
    }

    function testTransferZeroTokens() public {
        vm.prank(alice);
        bool success = this.transfer(bob, 0);
        assertTrue(success, "Transfer of zero tokens should succeed");
        assertEq(this.balanceOf(alice), maxTransferAmount, "Alice's balance should remain unchanged");
        assertEq(this.balanceOf(bob), 0, "Bob's balance should remain unchanged");
    }

    function testTransferToSelf() public {
        vm.prank(alice);
        bool success = this.transfer(alice, 1e18);
        assertTrue(success, "Transfer to self should succeed");
        assertEq(this.balanceOf(alice), maxTransferAmount, "Alice's balance should remain unchanged");
    }
}

contract WhenAliceHasInsufficientFunds is WhenTransferringTokens {
    uint256 internal mintAmount = maxTransferAmount - 1e18;

    function setUp() public override {
        WhenTransferringTokens.setUp();
        console.log("When Alice has insufficient funds");
        _mint(alice, mintAmount);
    }

    function itRevertsTransfer(address from, address to, uint256 amount, string memory expRevertMessage) public {
        vm.expectRevert(abi.encodePacked(expRevertMessage));
        transferToken(from, to, amount);
    }

    function testCannotTransferMoreThanAvailable() public {
        bytes memory invalid =
            abi.encodeWithSelector(ERC20InsufficientBalance.selector, alice, mintAmount, maxTransferAmount);
        itRevertsTransfer({from: alice, to: bob, amount: maxTransferAmount, expRevertMessage: string(invalid)});
    }

    function testCannotTransferToZero() public {
        bytes memory invalid = abi.encodeWithSelector(ERC20InvalidReceiver.selector, address(0));
        itRevertsTransfer({from: alice, to: address(0), amount: mintAmount, expRevertMessage: string(invalid)});
    }
}
