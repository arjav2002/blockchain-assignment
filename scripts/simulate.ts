import hre from "hardhat";
import DexSimulation from "../ignition/modules/DexSimulation.js"
import { pseudoRandomBytes, randomBytes } from "crypto";
import { localhost } from "viem/chains";
import { erc20Abi, SimulateContractParameters } from "viem";
import { HardhatViemHelpers } from "@nomicfoundation/hardhat-viem/types"
import { Abi } from "viem";
import { writeFile } from "fs/promises";
const N = Math.floor(Math.random() * 50) + 50; // swaps, deposits and withdrawals
const n_lps = 5n;
const n_traders = 8n;
const tokenA_supply = 1000000000000000000000000000000n;
const tokenB_supply = 1000000000000000000000000000000n;

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { Account } from "viem/accounts";

function createRandomWallet(): Account {
    const pk = generatePrivateKey();
    const acc = privateKeyToAccount(pk);
    return acc;
}

const lps: Account[] = []
const traders: Account[] = []
for (let i = 0; i < n_lps; i++) {
    lps.push(createRandomWallet());
}
for (let i = 0; i < n_traders; i++) {
    traders.push(createRandomWallet());
}

const transaction_types = ['swap', 'deposit', 'withdraw'];

function bigIntMin(a: bigint, b: bigint) {
    return a < b ? a : b;
}

function randomBigInt(min: bigint, max: bigint): bigint {
    if (min > max) {
        throw new Error(`min ${min} must be <= max ${max}`);
    }

    const range = max - min + 1n;
    if (range <= 0n) {
        throw new Error("Range too large");
    }

    // Calculate number of bytes needed
    const bitLength = range.toString(2).length;
    const byteLength = Math.ceil(bitLength / 8);

    while (true) {
        // Generate random bytes
        const buf = randomBytes(byteLength);

        // Convert bytes to bigint
        let rnd = 0n;
        for (let i = 0; i < buf.length; i++) {
            rnd = (rnd << 8n) + BigInt(buf[i]);
        }

        // Apply rejection sampling to avoid bias
        if (rnd < (1n << BigInt(byteLength * 8)) - ((1n << BigInt(byteLength * 8)) % range)) {
            return min + (rnd % range);
        }
    }
}

async function doTransaction(abi: Abi, name: string, sender: Account, contractAddress: any, args: readonly unknown[] | undefined, viem: HardhatViemHelpers) {
    const publicClient = await viem.getPublicClient();
    const walletClient = await viem.getWalletClient(sender.address);
    const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: abi,
        functionName: name,
        args: args,
        account: sender, // must be the token holder
    });

    const hash = await walletClient.writeContract(request);
}

async function initEth(address: `0x${string}`, viem: HardhatViemHelpers) {
    const publicClient = await viem.getPublicClient();
    await publicClient.request({
        method: "hardhat_setBalance" as any,
        params: [
            address,
            "0x3635C9ADC5DEA00000" // 1000 ETH in hex
        ],
    });
    const balance = await publicClient.getBalance({
        address: address,
    });

    console.log(`eth of ${address}: ${balance}`);

}

async function printBalance(tokenA: any, tokenB: any, tokenLp: any, address: `0x${string}`) {
    console.log(`Balance of ${address}`);
    console.log(typeof ((await tokenA.read.balanceOf([address]))))
    console.log(`tokensA: ${Number((await tokenA.read.balanceOf([address])) / 10n ** BigInt(await tokenA.read.decimals() - 2)) / 10 ** 2}`);
    console.log(`tokensB: ${Number((await tokenB.read.balanceOf([address])) / 10n ** BigInt(await tokenB.read.decimals() - 2)) / 10 ** 2}`);
    console.log(`tokensLp: ${Number((await tokenLp.read.balanceOf([address])) / 10n ** BigInt(await tokenLp.read.decimals() - 2)) / 10 ** 2}`);

}

async function printBalances(tokenA: any, tokenB: any, tokenLP: any) {
    for (const lp of lps) {
        await printBalance(tokenA, tokenB, tokenLP, lp.address);
    }
    for (const trader of traders) {
        await printBalance(tokenA, tokenB, tokenLP, trader.address)
    }
}

function insertDecimal(n: bigint, decimals: number): string {
    const str = n.toString();
    let ans = "";
    if (decimals >= str.length) {
        ans = "0." + "0".repeat(decimals - str.length)
    }
    else {
        ans = str.substring(0, str.length - decimals) + ".";
    }
    return ans + str.substring(Math.max(0, str.length - decimals - 1));
}

async function main() {
    const connection = await hre.network.connect();
    const { ignition, viem } = connection;
    const [deployer] = await viem.getWalletClients();
    const { tokenA, tokenB, tokenLP, dex } = await ignition.deploy(DexSimulation, {
        defaultSender: deployer.account.address, parameters: {
            DexSimulation: {
                "tokenA_supply": tokenA_supply,
                "tokenB_supply": tokenB_supply
            }
        }
    });

    for (const lp of lps) {
        await tokenA.write.transfer([lp.address, tokenA_supply / (n_lps + n_traders + 1n)]);
        await tokenB.write.transfer([lp.address, tokenB_supply / (n_lps + n_traders + 1n)]);
        await initEth(lp.address, viem);
    }

    for (const trader of traders) {
        await tokenA.write.transfer([trader.address, tokenA_supply / (n_lps + n_traders + 1n)]);
        await tokenB.write.transfer([trader.address, tokenB_supply / (n_lps + n_traders + 1n)]);
        await initEth(trader.address, viem);
    }

    // taken some initial reserves so that initial randomized swaps can be honoured
    const depositA = tokenA_supply / 2n / (n_lps + n_traders + 1n);
    const depositB = tokenB_supply / (n_lps + n_traders + 1n);
    await tokenA.write.approve([dex.address, depositA]);
    await tokenB.write.approve([dex.address, depositB]);
    await dex.write.deposit([depositA, depositB])

    console.log(`Number of transactions: ${N}`);

    const metrics: Record<string, Record<string, any[]>> = {
        "Liquidity": {
            "Total Value Locked (TVL)": [],
            "Reserve Ratios": [],
            "LP Token Distribution": []
        },
        "Trading Activity": {
            "Swap Volume": [],
            "Fee Accumulation": []
        },
        "Price Dynamics": {
            "Spot Price": [],
            "Slippage": []
        }
    };

    let tokenA_swapped = 0n;
    let tokenB_swapped = 0n;
    const feesCollected = [0n, 0n]
    const decimals_dex = await dex.read.decimals_precision();
    const decimals_tA = await tokenA.read.decimals();
    const decimals_tB = await tokenB.read.decimals();
    const decimals_tLp = await tokenLP.read.decimals();

    for (let i = 0; i < N; i++) {
        const resA = await dex.read.resA();
        const resB = await dex.read.resB();
        let slippage = NaN;
        const senderIndex = Math.floor(Math.random() * Number(n_lps + n_traders));
        const sender = senderIndex < n_lps ? lps[senderIndex] : traders[senderIndex - Number(n_lps)];
        const balance = await (await viem.getPublicClient()).getBalance({
            address: sender.address,
        });

        const allowed_transactions_types = senderIndex < n_lps ? transaction_types : ["swap"];
        const transaction_type = allowed_transactions_types[Math.floor(Math.random() * allowed_transactions_types.length)];
        console.log(`Transaction type: ${transaction_type}`)
        if (transaction_type == 'swap') {
            if (Math.random() > 0.5) {
                const tokensA_swap = randomBigInt(0n, bigIntMin(await tokenA.read.balanceOf([sender.address]), (await dex.read.resA()) / 10n));
                const tokenB_balanceBefore = await tokenB.read.balanceOf([sender.address]);
                await doTransaction(erc20Abi, "approve", sender, tokenA.address, [dex.address, tokensA_swap], viem);
                await doTransaction(dex.abi, "swapA", sender, dex.address, [tokensA_swap], viem);
                tokenA_swapped += tokensA_swap;
                const fees = await dex.read.calcFees([tokensA_swap]);
                feesCollected[0] += fees;
                const tokenB_balanceLater = await tokenB.read.balanceOf([sender.address]);
                const tokenB_receivedInSwap = tokenB_balanceLater - tokenB_balanceBefore;
                slippage = Number(tokenB_receivedInSwap * 10n ** 18n / (tokensA_swap - fees) - resB * 10n ** 18n / resA) / Number(resB * 10n ** 18n / resA) * 100;
            }
            else {
                const tokensB_swap = randomBigInt(0n, bigIntMin(await tokenB.read.balanceOf([sender.address]), (await dex.read.resB()) / 10n));
                const tokenA_balanceBefore = await tokenA.read.balanceOf([sender.address]);
                await doTransaction(erc20Abi, "approve", sender, tokenB.address, [dex.address, tokensB_swap], viem);
                await doTransaction(dex.abi, "swapB", sender, dex.address, [tokensB_swap], viem);
                tokenB_swapped += tokensB_swap;
                const fees = await dex.read.calcFees([tokensB_swap]);
                feesCollected[1] += fees;
                const tokenA_balanceLater = await tokenA.read.balanceOf([sender.address]);
                const tokenA_receivedInswap = tokenA_balanceLater - tokenA_balanceBefore;
                slippage = Number(tokenA_receivedInswap * 10n ** 18n / (tokensB_swap - fees) - resA * 10n ** 18n / resB) / Number(resA * 10n ** 18n / resB) * 100;
            }
        }
        else if (transaction_type == 'deposit') {
            const tokensA_balance = await tokenA.read.balanceOf([sender.address]);
            const tokensB_balance = await tokenB.read.balanceOf([sender.address]);
            const resA = await dex.read.resA();
            const resB = await dex.read.resB();
            // const decimals = await dex.read.decimals_precision();
            //await dex.read.spotPrice();
            const tokensA_deposit_range = (tokensA_balance * resB > resA * tokensB_balance) ? tokensB_balance * resA / resB : tokensA_balance;
            const tokensA_deposit = randomBigInt(0n, BigInt(tokensA_deposit_range));
            const tokensB_deposit = tokensA_deposit * resB / resA;
            await doTransaction(erc20Abi, "approve", sender, tokenA.address, [dex.address, tokensA_deposit], viem);
            await doTransaction(erc20Abi, "approve", sender, tokenB.address, [dex.address, tokensB_deposit], viem);
            await doTransaction(dex.abi, "deposit", sender, dex.address, [tokensA_deposit, tokensB_deposit], viem);
        }
        else if (transaction_type == 'withdraw') {
            const lp_balance = await tokenLP.read.balanceOf([sender.address]);
            const tokensLp_amt = randomBigInt(0n, lp_balance);
            await doTransaction(erc20Abi, "approve", sender, tokenLP.address, [dex.address, tokensLp_amt], viem);
            await doTransaction(dex.abi, "withdraw", sender, dex.address, [tokensLp_amt], viem);
        }

        const spotPrice = await dex.read.spotPrice();

        const tvl = resA + resB * spotPrice / 10n ** decimals_dex;
        metrics["Liquidity"]["Total Value Locked (TVL)"].push(insertDecimal(tvl, decimals_tA));
        metrics["Liquidity"]["Reserve Ratios"].push(insertDecimal(resA * 10n ** decimals_dex / resB, Number(decimals_dex)));
        const lp_holdings = [];
        for (const lp of lps) {
            lp_holdings.push(insertDecimal((await tokenLP.read.balanceOf([lp.address])), decimals_tLp));
        }
        metrics["Liquidity"]["LP Token Distribution"].push(lp_holdings);

        metrics["Trading Activity"]["Swap Volume"].push([insertDecimal(tokenA_swapped, decimals_tA), insertDecimal(tokenB_swapped, decimals_tB)])
        metrics["Trading Activity"]["Fee Accumulation"].push([insertDecimal(feesCollected[0], decimals_tA), insertDecimal(feesCollected[1], decimals_tB)]);

        metrics["Price Dynamics"]["Spot Price"].push(insertDecimal(spotPrice, Number(decimals_dex)));
        metrics["Price Dynamics"]["Slippage"].push(slippage + "%");
    }

    await printBalances(tokenA, tokenB, tokenLP);

    await writeFile("metrics.json", JSON.stringify(metrics))
}

main().catch(console.error);