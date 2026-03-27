// contracts/DEX.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Token} from './Token.sol';
import {LPToken} from './LPToken.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
using Strings for uint256;

contract DEX {
    Token private _tokenA;
    Token private _tokenB;
    LPToken private _tokenLp;

    uint256 private a_res;
    uint256 private b_res;
    uint256 private decimals;

    constructor(address tokenA, address tokenB, address tokenLp){
        _tokenA = Token(tokenA);
        _tokenB = Token(tokenB);
        _tokenLp = LPToken(tokenLp);
        a_res = b_res = 0;
        decimals = 18;
    }

    function deposit(uint256 a_amt, uint256 b_amt) public {
        // require(a_amt > 0, "Number of a tokens needs to be more than zero");
        // require(b_amt > 0, "Number of b tokens needs to be more than zero");
        require(a_amt <= _tokenA.balanceOf(msg.sender), "You don't have enough a tokens");
        require(b_amt <= _tokenB.balanceOf(msg.sender), "You don't have enough b tokens");

        uint256 newLP_amt = 10**_tokenLp.decimals();
        
        if(a_res != 0)
        {
            require(
                // we do it like this and not like a_amt*b_res == b_amt*a_res because
                // if a_res and b_res are both prime, then LPs will be forced to set a_amt=a_res*x && b_amt=b_res*x
                (a_amt == a_res*b_amt/b_res || b_amt == b_res*a_amt/a_res),
                "We need a_amt == a_res*b_amt/b_res || b_amt == b_res*a_amt/a_res"
                );

            newLP_amt = _tokenLp.totalSupply() * a_amt/a_res;
        }

        require(_tokenA.transferFrom(msg.sender, address(this), a_amt), "Ensure enough token A has been approved");
        require(_tokenB.transferFrom(msg.sender, address(this), b_amt), "Ensure enough token B has been approved");
        a_res += a_amt;
        b_res += b_amt;
        _tokenLp.mint(msg.sender, newLP_amt);
    }

    function withdraw(uint256 lp_amt) public
    {
        // require(lp_amt > 0, "Cannot withdraw zero LP tokens");
        require(lp_amt <= _tokenLp.balanceOf(msg.sender), "You don't have enough LP Tokens");

        uint256 tokensA_transfer = lp_amt * a_res / _tokenLp.totalSupply();
        uint256 tokensB_transfer = lp_amt * b_res / _tokenLp.totalSupply();

        _tokenLp.burn(msg.sender, lp_amt);
        a_res -= tokensA_transfer;
        b_res -= tokensB_transfer;
        require(_tokenA.transfer(msg.sender, tokensA_transfer), "Error remitting A tokens for LP tokens");
        require(_tokenB.transfer(msg.sender, tokensB_transfer), "Error remitting B tokens for LP tokens");
    }

    function calcFees(uint256 amt) public pure returns (uint256)
    {
        return amt * 3 / 1000;
    }

    function decimals_precision() public view returns (uint256)
    {
        return decimals;
    }

    function spotPrice() public view returns (uint256)
    {
        return 10**decimals * a_res / b_res;
    }

    function tokenAprice() public view returns (uint256)
    {
        // how many b per a
        return 10**(2*decimals) * 1/spotPrice();
    }

    function tokenBprice() public view returns (uint256)
    {
        // how many a per b
        return spotPrice();
    }


    function resA() public view returns (uint256)
    {
        return a_res;
    }

    function resB() public view returns (uint256)
    {
        return b_res;
    }

    function swapA(uint256 a_amt) public 
    {
        // require(a_amt > 0, "Cannot swap 0 A tokens");
        require(a_amt <= _tokenA.balanceOf(msg.sender), "You don't have enough token A");
        bool succeeded = _tokenA.transferFrom(msg.sender, address(this), a_amt);
        require(succeeded, "Ensure enough token A has been approved");

        uint256 fees = calcFees(a_amt);
        a_amt -= fees;
        require(a_amt>0, "Tokens not enough to cover fees");

        uint256 b_amt = b_res - (a_res * b_res) / (a_res + a_amt);

        a_res += a_amt;
        b_res -= b_amt;

        require(_tokenB.transfer(msg.sender, b_amt), "Issue while sending B tokens in A->B swap");
    }

    function swapB(uint256 b_amt) public
    {
        // require(b_amt > 0, "Cannot swap 0 B tokens");
        require(b_amt <= _tokenB.balanceOf(msg.sender), "You don't have enough token B");
        require(_tokenB.transferFrom(msg.sender, address(this), b_amt), "Ensure enough token B has been approved");

        uint256 fees = calcFees(b_amt);
        b_amt -= fees;
        require(b_amt>0, "Tokens not enough to cover fees");

        uint256 a_amt = a_res - (a_res * b_res) / (b_res+b_amt);
        
        a_res -= a_amt;
        b_res += b_amt;

        require(_tokenA.transfer(msg.sender, a_amt), "Issue while remitting A tokens in B->A swap");
    }
}