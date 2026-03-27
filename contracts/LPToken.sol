// contracts/Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPToken is ERC20 {

    address private _dex;
    address private _owner;

    constructor() ERC20("LPToken", "LPTKN") {
        _dex = address(0);
        _owner = msg.sender;
    }

    function setDEX(address dex) public
    {
        require(msg.sender==_owner, "You are not owner, you cannot set the DEX");
        require(_dex==address(0), "DEX has already been set.");

        _dex = dex;
    }
    
    function mint(address account, uint tokens) public
    {
        require(msg.sender==_dex, "LP Tokens cannot be minted outside of DEX");
        _mint(account, tokens);
    }

    function burn(address account, uint tokens) public
    {
        require(msg.sender==_dex, "LP Tokens cannot be burnt outside of DEX");
        _burn(account, tokens);
    }
}