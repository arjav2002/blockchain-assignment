export interface Transaction {
    sender: number,
    type: string,
    tokenA: number,
    tokenB: number,
    tokenLP: number
}

export interface Account {
    address: `0x${string}`,
    privateKey: `0x${string}`
}