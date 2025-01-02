// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Cinnamonroll.sol";
import "../src/Multicall.sol";

contract CinnamonrollTest is Test {
    Cinnamonroll cinnamonroll;
    Multicall multicall;
    address owner;
    address addr1;
    address addr2;

    function setUp() public {
        owner = address(this); // Test contract acts as the deployer
        addr1 = address(0x123);
        addr2 = address(0x456);

        // Deploy Cinnamonroll contract
        cinnamonroll = new Cinnamonroll();

        // Deploy Multicall contract
        multicall = new Multicall();

        // Mint initial supply is handled in constructor
    }

    function testMintInitialSupplyToOwner() public {
        uint256 balance = cinnamonroll.balanceOf(owner);
        assertEq(balance, 100 ether, "Initial supply should be 100 CINA");
    }

    function testTransferTokensBetweenAccounts() public {
        cinnamonroll.transfer(addr1, 10 ether);
        uint256 balance = cinnamonroll.balanceOf(addr1);
        assertEq(balance, 10 ether, "Address1 should have 10 CINA");
    }

    function testPreventTransfersToContractAddress() public {
        vm.expectRevert(bytes("ERC20: transfer to the contract address"));
        cinnamonroll.transfer(address(cinnamonroll), 10 ether);
    }

    function testExecuteMulticall() public {
        address cinaAddress = address(cinnamonroll);

        bytes;
        calls[0] = abi.encodeWithSignature("symbol()");
        calls[1] = abi.encodeWithSignature("decimals()");

        // Perform the multicall
        (bool success, bytes[] memory results) = multicall.aggregate(
            cinaAddress,
            calls
        );

        assertTrue(success, "Multicall should succeed");
        assertEq(
            abi.decode(results[0], (string)),
            "CINA",
            "Token symbol should be CINA"
        );
        assertEq(
            abi.decode(results[1], (uint8)),
            18,
            "Token decimals should be 18"
        );
    }

    function testFetchTransferEvents() public {
        // Transfer some tokens
        cinnamonroll.transfer(addr1, 10 ether);

        // Check for transfer events
        uint256 logs = vm.recordLogs();
        (address from, address to, uint256 value) = abi.decode(
            vm.getLog(logs - 1).data,
            (address, address, uint256)
        );

        assertEq(from, owner, "Transfer should be from owner");
        assertEq(to, addr1, "Transfer should be to addr1");
        assertEq(value, 10 ether, "Transferred value should be 10 CINA");
    }

    function testRecoverTokens() public {
        // Transfer tokens to the contract itself
        cinnamonroll.transfer(address(cinnamonroll), 5 ether);
        uint256 contractBalanceBefore = cinnamonroll.balanceOf(
            address(cinnamonroll)
        );
        assertEq(contractBalanceBefore, 5 ether, "Contract should have 5 CINA");

        // Recover tokens
        cinnamonroll.recoverTokens(address(cinnamonroll), 5 ether);
        uint256 contractBalanceAfter = cinnamonroll.balanceOf(
            address(cinnamonroll)
        );
        assertEq(
            contractBalanceAfter,
            0,
            "Contract balance should be 0 after recovery"
        );
    }
}
