// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Multicall {
    struct Call {
        address target;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    /// @notice Aggregate multiple calls into one
    /// @param calls Array of Call structs
    /// @return returnData Array of Result structs with call outcomes
    function aggregate(
        Call[] calldata calls
    ) external returns (Result[] memory returnData) {
        uint256 callCount = calls.length;
        returnData = new Result[](callCount);

        for (uint256 i = 0; i < callCount; i++) {
            (bool success, bytes memory data) = calls[i].target.call(
                calls[i].callData
            );
            returnData[i] = Result(success, data);
        }
    }
}
