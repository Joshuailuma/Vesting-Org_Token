// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract OrgToken {
    // A struct containing the company's details
    struct CompanyDetails {
        string tokenName;
        string tokenAbbrev;
        string stakeholder;
        uint256 endPeriod;
        uint256 startPeriod;
        uint256 totalSupply;
        mapping(address => uint) whitelistedAddressBalance;
    }

    // Company address to its details
    mapping(address => CompanyDetails) company;

    //Balance of an address
    mapping(address => uint) balance;

    modifier isCompany() {
        CompanyDetails storage companyDetails = company[msg.sender];

        require(
            bytes(companyDetails.tokenName).length > 0,
            "You are not an Org"
        );
        _;
    }

    /**
     * To register a company
     * @param _tokenName name the compaany calls the token
     * @param _tokenAbbrev abbreviation of the name
     */
    function registerCompany(
        string memory _tokenName,
        string memory _tokenAbbrev,
        uint256 _totalSupply
    ) public {
        // Get the struct from storage
        CompanyDetails storage companyDetails = company[msg.sender];

        // update the details
        companyDetails.tokenName = _tokenName;
        companyDetails.tokenAbbrev = _tokenAbbrev;
        companyDetails.totalSupply = _totalSupply;
    }

    function setStakeholderAndPeriod(
        string memory _stakeholder,
        uint256 _period
    ) public isCompany {
        // Get the struct from storage
        CompanyDetails storage companyDetails = company[msg.sender];

        // update the details
        companyDetails.stakeholder = _stakeholder;
        companyDetails.endPeriod = _period;
        companyDetails.startPeriod = block.timestamp;
    }

    function whiteListAddress(
        address _addressToBeWhiteListed,
        uint amount
    ) public isCompany {
        // Get the struct from storage
        CompanyDetails storage companyDetails = company[msg.sender];
        // Total token supply must be greater than the amount that wants to be given to the address
        require(
            companyDetails.totalSupply >= amount,
            "Not enough token present in supply"
        );
        //Give the address the amount
        companyDetails.whitelistedAddressBalance[
            _addressToBeWhiteListed
        ] = amount;
        // Subtract the amount given out from total supply
        companyDetails.totalSupply -= amount;
    }

    function claimToken(address _companyAddress) public {
        // Get the struct from storage
        CompanyDetails storage companyDetails = company[_companyAddress];
        // Can claim after vesting time has elapsed
        require(
            block.timestamp >
                (companyDetails.endPeriod + companyDetails.startPeriod),
            "Vesting period not elapsed"
        );

        uint amountPresent = companyDetails.whitelistedAddressBalance[
            msg.sender
        ];
        require(amountPresent > 0, "You have no token to claim");
        companyDetails.whitelistedAddressBalance[msg.sender] = 0;

        // Mint the token
        _mint(msg.sender, amountPresent);
    }

    function _mint(address _address, uint _value) private {
        balance[_address] += _value;
    }

    function getTotalSupply() public view returns (uint256) {
        CompanyDetails storage companyDetails = company[msg.sender];
        return companyDetails.totalSupply;
    }

    function getTokenPeriod(
        address companyAddress
    ) public view returns (uint256) {
        CompanyDetails storage companyDetails = company[companyAddress];
        return companyDetails.endPeriod;
    }

    function getStakeholder(
        address companyAddress
    ) public view returns (string memory) {
        CompanyDetails storage companyDetails = company[companyAddress];
        return companyDetails.stakeholder;
    }

    function whitelistedBalanceBeforewithdrawal(
        address companyAddress
    ) public view returns (uint256) {
        CompanyDetails storage companyDetails = company[companyAddress];
        return companyDetails.whitelistedAddressBalance[msg.sender];
    }

    function getMyBalance() public view returns (uint256) {
        return balance[msg.sender];
    }
}
