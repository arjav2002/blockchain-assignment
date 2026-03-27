// contracts/Arbitrage.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {DEX} from './DEX.sol';
import "@openzeppelin/contracts/utils/Strings.sol";


import {Token} from './Token.sol';

contract Arbitrage {

    DEX private _dex1;
    DEX private _dex2;
    Token private _tokenA;
    Token private _tokenB;
    uint256 private immutable _minProfitPercentage = 5; 

    constructor(address dex1, address dex2, address tokenA, address tokenB)
    {
        _dex1 = DEX(dex1);
        _dex2 = DEX(dex2);
        _tokenA = Token(tokenA);
        _tokenB = Token(tokenB);
    }

    enum TokenNo { A, B }
    function execute(uint256 token_amt, TokenNo initialTokenType) public
    {
        uint256 initial_a = _tokenA.balanceOf(address(this));
        uint256 initial_b = _tokenB.balanceOf(address(this));

        require((initialTokenType == TokenNo.A ? _tokenA : _tokenB).balanceOf(msg.sender) >= token_amt, "You do not have enough tokens");
        bool success = (initialTokenType == TokenNo.A ? _tokenA : _tokenB).transferFrom(msg.sender, address(this), token_amt);
        require(success, "Issue while accepting tokens");

        uint256 sp1 = _dex1.spotPrice();
        uint256 sp2 = _dex2.spotPrice();

        uint256 d1 = _dex1.decimals_precision();
        uint256 d2 = _dex2.decimals_precision();

        uint256 oldBalance = (initialTokenType == TokenNo.A ? initial_a : initial_b);
        uint256 newBalance = 0;
        require(sp1 * 10**(d2-d1) != sp2, "There is no arbitrage opportunity");

        if(initialTokenType == TokenNo.A)
        {
            _tokenA.approve(address((sp1 * 10**(d2-d1) < sp2) ? _dex1 : _dex2), token_amt);
            ((sp1 * 10**(d2-d1) < sp2) ? _dex1 : _dex2).swapA(token_amt);
            uint256 gotten_b = _tokenB.balanceOf(address(this)) - initial_b;
            _tokenB.approve(address((sp1 * 10**(d2-d1) < sp2) ? _dex2 : _dex1), gotten_b);
            ((sp1 * 10**(d2-d1) < sp2) ? _dex2 : _dex1).swapB(gotten_b);
            // require(_tokenA.balanceOf(address(this)) > token_amt+initial_a, "Loss will happen");
            newBalance = _tokenA.balanceOf(address(this));
            // require(profit*100/token_amt >= _minProfitPercentage, "Profit gotten is less than minimum percentage");
        }
        else
        {
            _tokenB.approve(address((sp1 * 10**(d2-d1) < sp2) ? _dex1 : _dex2), token_amt);
            ((sp1 * 10**(d2-d1) < sp2) ? _dex1 : _dex2).swapB(token_amt);
            uint256 gotten_a = _tokenA.balanceOf(address(this)) - initial_a;
            _tokenA.approve(address((sp1 * 10**(d2-d1) < sp2) ? _dex2 : _dex1), gotten_a);
            ((sp1 * 10**(d2-d1) < sp2) ? _dex2 : _dex1).swapA(gotten_a);
            // require(_tokenB.balanceOf(address(this)) > token_amt+initial_b, "Loss will happen");
            newBalance = _tokenB.balanceOf(address(this));
            // require(profit*100/token_amt >= _minProfitPercentage, "Profit gotten is less than minimum percentage");            
        }
        (initialTokenType == TokenNo.A ? _tokenA : _tokenB).transfer(msg.sender, newBalance-oldBalance);
    }
    
}