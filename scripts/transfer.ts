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

    const recv = "0xdeadbeef";
    const tokenA_amt = 500n;
    const tokenB_amt = 500n;
    await doTransaction(publicClient, await tokenA.write.transfer([recv, tokenA_amt]));
    await doTransaction(publicClient, await tokenB.write.transfer([recv, tokenB_amt]));
}

main().catch(console.error)