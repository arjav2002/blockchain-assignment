import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ArbitrageSimulation", (m) => {
    const tokenA_supply = m.getParameter("tokenA_supply");
    const tokenB_supply = m.getParameter("tokenB_supply");
    const tokenA = m.contract("Token", [tokenA_supply], {
        id: "TokenA"
    });
    const tokenB = m.contract("Token", [tokenB_supply], {
        id: "TokenB"
    });
    const tokenLP = m.contract("LPToken", [], {
        id: "LPToken1"
    });
    const dex = m.contract("DEX", [tokenA, tokenB, tokenLP], {
        id: "Dex1"
    });

    const tokenLP2 = m.contract("LPToken", [], {
        id: "LPToken2"
    });
    const dex2 = m.contract("DEX", [tokenA, tokenB, tokenLP2], {
        id: "Dex2"
    });

    const arbitrage = m.contract("Arbitrage", [dex, dex2, tokenA, tokenB])

    m.call(tokenLP, "setDEX", [dex]);
    m.call(tokenLP2, "setDEX", [dex2]);

    return { tokenA, tokenB, tokenLP, dex, tokenLP2, dex2, arbitrage };
});