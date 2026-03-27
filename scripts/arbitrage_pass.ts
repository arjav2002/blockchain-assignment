import hre from "hardhat"
import ArbitrageSimulation from "../ignition/modules/ArbitrageSimulation.js";

const tokenA_supply = 1000000000000000000000000000000n;
const tokenB_supply = 1000000000000000000000000000000n;

async function doTransaction(publicClient: any, hash: `0x${string}`) {
    await publicClient.waitForTransactionReceipt({
        hash,
    });
}

async function main() {
    const connection = await hre.network.connect();
    const { ignition, viem } = connection;
    const [deployer] = await viem.getWalletClients();
    const { tokenA, tokenB, tokenLP, dex, tokenLP2, dex2, arbitrage } = await connection.ignition.deploy(ArbitrageSimulation, {
        defaultSender: deployer.account.address, parameters: {
            ArbitrageSimulation: {
                "tokenA_supply": tokenA_supply,
                "tokenB_supply": tokenB_supply
            }
        }
    })

    const publicClient = await viem.getPublicClient();

    const bal = await tokenLP.read.balanceOf([deployer.account.address]);
    if (bal) await doTransaction(publicClient, await dex.write.withdraw([bal]));
    const bal2 = await tokenLP2.read.balanceOf([deployer.account.address]);
    if (bal2) await doTransaction(publicClient, await dex2.write.withdraw([bal2]));
    console.log(`Cleared both DEXes`);

    await doTransaction(publicClient, await tokenA.write.approve([dex.address, 10000n]))
    await doTransaction(publicClient, await tokenA.write.approve([dex2.address, 10000n]));
    await doTransaction(publicClient, await tokenB.write.approve([dex.address, 10000n]));
    await doTransaction(publicClient, await tokenB.write.approve([dex2.address, 9000n]));

    await doTransaction(publicClient, await dex.write.deposit([10000n, 10000n]))
    await doTransaction(publicClient, await dex2.write.deposit([10000n, 9000n]))
    // return;

    const earlierBalance = await tokenA.read.balanceOf([deployer.account.address]);
    console.log(`Balance before arbitrage: ${earlierBalance}`)

    // profit is made
    await doTransaction(publicClient, await tokenA.write.approve([arbitrage.address, 100n]));
    const arbitrageHash = await arbitrage.write.execute([100n, 0]);
    await doTransaction(publicClient, arbitrageHash);
    console.log(`Successful Arbitrage: ${arbitrageHash}`);

    const newBalance = await tokenA.read.balanceOf([deployer.account.address]);
    console.log(`Balance after arbitrage: ${newBalance}`)
    console.log(`Profit: ${newBalance - earlierBalance}`)

}

main().catch(console.error)