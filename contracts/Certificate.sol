// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

contract Certificate {
    address public manager;

    constructor() {
        manager = msg.sender;
    }

    string certificate_id;
    string file_name;
    string timestamp_of_upload;

    function addCertificate(
        string memory _certificate_id,
        string memory _file_name,
        string memory _timestamp_of_upload
    ) public {
        require(msg.sender == manager, "Only manager can add contract");
        certificate_id = _certificate_id;
        file_name = _file_name;
        timestamp_of_upload = _timestamp_of_upload;
    }

    function getCertificate() public view returns (string[] memory) {
        string[] memory output = new string[](3);
        output[0] = certificate_id;
        output[1] = file_name;
        output[2] = timestamp_of_upload;
        return output;
    }
}
