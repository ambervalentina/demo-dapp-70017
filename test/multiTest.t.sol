// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {Multicall3} from "../contracts/Multicall.sol";

contract multiTest is Test {
    Multicall3 multicall;
    address owner;
    address addr1;
    address addr2;

    function setUp() public {
        owner = address(this);
        addr1 = address(0x123);
        addr2 = address(0x456);

        multicall = new Multicall3();
    }

    function testAggregate3() public {
        address multiAddress = address(multicall);
        Multicall3.Call3[] memory calls = new Multicall3.Call3[](3);
        calls[0] = Multicall3.Call3(multiAddress, false, abi.encodeWithSignature("getBlockHash(uint256)", block.number));
        calls[1] = Multicall3.Call3(multiAddress, true, abi.encodeWithSignature("thisMethodReverts()"));
        calls[2] = Multicall3.Call3(address(multicall), true, abi.encodeWithSignature("getCurrentBlockTimestamp()"));
        Multicall3.Result[] memory returnData = multicall.aggregate3(calls);

        // Call 1.
        assertTrue(returnData[0].success);
        assertEq(blockhash(block.number), abi.decode(returnData[0].returnData, (bytes32)));

        // Call 2.
        assertTrue(!returnData[1].success);
        assertEq(returnData[1].returnData.length, 4);
        assertEq(bytes4(returnData[1].returnData), bytes4(keccak256("Unsuccessful()")));

        // Call 3.
        assertTrue(returnData[2].success);
        assertEq(abi.decode(returnData[2].returnData, (uint256)), block.timestamp);
    }

    function testAggregate3Unsuccessful() public {
        address multiAddress = address(multicall);
        Multicall3.Call3[] memory calls = new Multicall3.Call3[](2);
        calls[0] = Multicall3.Call3(
            address(multiAddress), false, abi.encodeWithSignature("getBlockHash(uint256)", block.number)
        );
        calls[1] = Multicall3.Call3(address(multiAddress), false, abi.encodeWithSignature("thisMethodReverts()"));
        vm.expectRevert(bytes("Multicall3: call failed"));
        multicall.aggregate3(calls);
    }
}
