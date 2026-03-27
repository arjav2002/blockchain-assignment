import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DexSimulation", (m) => {
    const tokenA_supply = m.getParameter("tokenA_supply");
    const tokenB_supply = m.getParameter("tokenB_supply");
    const tokenA = m.contract("Token", [tokenA_supply], {
        id: "TokenA"
    });
    const tokenB = m.contract("Token", [tokenB_supply], {
        id: "TokenB"
    });
    const tokenLP = m.contract("LPToken");
    const dex = m.contract("DEX", [tokenA, tokenB, tokenLP]);

    m.call(tokenLP, "setDEX", [dex]);

    return { tokenA, tokenB, tokenLP, dex };
});