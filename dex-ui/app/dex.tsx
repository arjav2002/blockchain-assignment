import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3 from 'web3';

const Dex = () => {

    const tokenAHash = "0x1898001a3589D9d4A7c8db74835027Fd86eA768C";
    const tokenBHash = "0x19962d66Ac2508CEF7C4AcdAB4e94C4869Cb6A6d";
    const tokenLpHash = "0xb2B97915E649DC95Db7ac51eE90923C34d7f6EDa";
    const dexHash = "0x2aAb6Ecaa01C66A5b0886FAf523658E6E0eb5307";
    const dexabi = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "tokenA",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "tokenB",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "tokenLp",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amt",
                    "type": "uint256"
                }
            ],
            "name": "calcFees",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals_precision",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "a_amt",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "b_amt",
                    "type": "uint256"
                }
            ],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "resA",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "resB",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "spotPrice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "a_amt",
                    "type": "uint256"
                }
            ],
            "name": "swapA",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "b_amt",
                    "type": "uint256"
                }
            ],
            "name": "swapB",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "tokenAprice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "tokenBprice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "lp_amt",
                    "type": "uint256"
                }
            ],
            "name": "withdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];
    const tokenabi = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "initialSupply",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "allowance",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "needed",
                    "type": "uint256"
                }
            ],
            "name": "ERC20InsufficientAllowance",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "balance",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "needed",
                    "type": "uint256"
                }
            ],
            "name": "ERC20InsufficientBalance",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "approver",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidApprover",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidReceiver",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidSender",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidSpender",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];
    const lptokenabi = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "allowance",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "needed",
                    "type": "uint256"
                }
            ],
            "name": "ERC20InsufficientAllowance",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "balance",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "needed",
                    "type": "uint256"
                }
            ],
            "name": "ERC20InsufficientBalance",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "approver",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidApprover",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidReceiver",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidSender",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidSpender",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "burn",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "mint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "dex",
                    "type": "address"
                }
            ],
            "name": "setDEX",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const [account, setAccount] = useState(null);

    const [tokenABalance, setTokenABalance] = useState(null);
    const [tokenBBalance, setTokenBBalance] = useState(null);
    const [lpTokenBalance, setLpTokenBalance] = useState(null);
    const [resA, setResA] = useState("");
    const [resB, setResB] = useState("");
    const [a_d, setAd] = useState(0)
    const [b_d, setBd] = useState(0)
    const [lp_d, setLpd] = useState(0)
    const [spotPrice, setSpotPrice] = useState(0n);
    const [sp_d, setSpd] = useState(0n);

    const checkNetwork = async () => {
        if (window.ethereum) {
            await window.ethereum.enable();
            window.web3 = new Web3(window.ethereum);
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }

        const accounts = await window.web3.eth.getAccounts();
        setAccount(accounts[0])
    }


    useEffect(() => {
        checkNetwork();
    }, [])

    function insertDecimal(n: bigint, decimals: number): string {
        const str = n.toString();
        let ans = "";
        if (decimals >= str.length) {
            ans = "0." + "0".repeat(decimals - str.length)
        }
        else {
            ans = str.substring(0, str.length - decimals) + ".";
        }
        return ans + str.substring(Math.max(0, str.length - decimals));
    }

    function convertToBasicUnit(amt: string, decimals: number): bigint {
        if (!amt.includes('.')) amt += '.';
        amt = amt.trim();
        while (amt[amt.length - 1] == '0') amt = amt.substring(0, amt.length - 1);
        const preExistingdecimals = amt.length - 1 - amt.indexOf('.');
        return BigInt(amt.replace(".", "")) * 10n ** BigInt(decimals - preExistingdecimals);
    }

    const setBalance = (setBalance, hash, abi = tokenabi) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const a = new ethers.Contract(hash, abi, provider);
        a.balanceOf(account).then(async (x) => setBalance(insertDecimal(x, await a.decimals()))).catch(err => console.log(err))
    }

    const setReserve = (setReserve, functionName, tokenHash) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const dex = new ethers.Contract(dexHash, dexabi, provider);
        const token = new ethers.Contract(tokenHash, tokenabi, provider)
        dex[functionName]().then(async (x) => setReserve(insertDecimal(x, await token.decimals()))).catch(err => console.log(err))
    }

    const setDecimals = (setDecimal, hash, abi = tokenabi, functionName = "decimals") => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const a = new ethers.Contract(hash, abi, provider);
        a[functionName]().then(async (x) => setDecimal(x)).catch(err => console.log(err))
    }

    const setSpotPriceValue = () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const a = new ethers.Contract(dexHash, dexabi, provider);
        a.spotPrice().then(async (x) => setSpotPrice(x)).catch(err => console.log(err))
    }

    const resetBalances = () => {
        setBalance(setTokenABalance, tokenAHash)
        setBalance(setTokenBBalance, tokenBHash);
        setBalance(setLpTokenBalance, tokenLpHash, lptokenabi)
        setReserve(setResA, "resA", tokenAHash);
        setReserve(setResB, "resB", tokenBHash)
        setSpotPriceValue();
        setDecimals(setAd, tokenAHash);
        setDecimals(setBd, tokenBHash)
        setDecimals(setLpd, tokenLpHash, lptokenabi)
        setDecimals(setSpd, dexHash, dexabi, "decimals_precision");
    }

    useEffect(() => {
        resetBalances();
    }, [account])

    const swap = async (amt, tokenHash, functionName) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const token = new ethers.Contract(tokenHash, tokenabi, await provider.getSigner())
        const dex = new ethers.Contract(dexHash, dexabi, await provider.getSigner());
        token.approve(dex.address, amt, { gasLimit: 50_000 }).then(async (x) => {
            dex[functionName](amt, { gasLimit: 250_000 }).then(async (x) => await resetBalances()).catch(err => console.log(err));
        }).catch(err => console.log("Error while approving", err));
    }

    const swapA = async (a_amt) => {
        await swap(a_amt, tokenAHash, "swapA");
    }

    const swapB = async (b_amt) => {
        await swap(b_amt, tokenBHash, "swapB");
    }

    const deposit = async (a_amt: bigint, b_amt: bigint) => {
        const resAbigint = convertToBasicUnit(resA, a_d);
        const resBbigint = convertToBasicUnit(resB, b_d);
        if (resAbigint && resBbigint && a_amt != b_amt * resAbigint / resBbigint && b_amt != a_amt * resBbigint / resAbigint) {
            alert("Quantities not in sync with res ratio");
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tokenA = new ethers.Contract(tokenAHash, tokenabi, await provider.getSigner())
        const tokenB = new ethers.Contract(tokenBHash, tokenabi, await provider.getSigner())
        const dex = new ethers.Contract(dexHash, dexabi, await provider.getSigner());
        tokenA.approve(dex.address, a_amt, { gasLimit: 50_000 }).then(async (x) => {
            tokenB.approve(dex.address, b_amt, { gasLimit: 50_000 }).then(async (x) => {
                dex.deposit(a_amt, b_amt, { gasLimit: 500_000 }).then(async (x) => resetBalances()).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }).catch(err => console.log(err));
    }

    const syncBWithRes = () => {
        const resAbigint = convertToBasicUnit(resA, a_d);
        const resBbigint = convertToBasicUnit(resB, b_d);
        if (resBbigint == 0n || resAbigint == 0n) return;
        const a_amt = convertToBasicUnit(document.getElementById("aquant").value.toString(), a_d);
        const b_amt = BigInt(a_amt) * resBbigint / resAbigint;
        document.getElementById("bquant").value = insertDecimal(b_amt, b_d);
    }

    const syncAWithRes = () => {
        const resAbigint = convertToBasicUnit(resA, a_d);
        const resBbigint = convertToBasicUnit(resB, b_d);
        if (resBbigint == 0n || resAbigint == 0n) return;
        const b_amt = convertToBasicUnit(document.getElementById("bquant").value.toString(), b_d);
        const a_amt = b_amt * resAbigint / resBbigint;
        document.getElementById("aquant").value = insertDecimal(a_amt, a_d);
    }

    const withdraw = async (lp_amt) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const dex = new ethers.Contract(dexHash, dexabi, await provider.getSigner());
        dex.withdraw(lp_amt, { gasLimit: 100_000 }).then(x => resetBalances()).catch(err => console.log(err));
    }

    return (
        <div>
            <div>
                Connected Account: {account}
                <br></br>
                Token A balance: {tokenABalance}
                <br></br>
                Token B balance: {tokenBBalance}
                <br></br>
                Token LP balance: {lpTokenBalance}
                <br></br>
                Dex Reserves:
                <br></br>
                ResA: {resA}
                <br></br>
                ResB: {resB}
                <br></br>
                Spot Price: {insertDecimal(spotPrice, Number(sp_d))}
            </div>
            <div>
                A:
                <input type="number" id="aquant" onChange={syncBWithRes}></input>
                <button style={{
                    padding: "10px",
                    border: "1px solid black",
                    background: "lightgray"
                }} onClick={() => swapA(convertToBasicUnit(document.getElementById("aquant").value.toString(), a_d))}>Swap A</button>
                <br></br>
                B:
                <input type="number" id="bquant" onChange={syncAWithRes}></input>
                <button style={{
                    padding: "10px",
                    border: "1px solid black",
                    background: "lightgray"
                }} onClick={() => swapB(convertToBasicUnit(document.getElementById("bquant").value.toString(), b_d))}>Swap B</button>
            </div>
            <div>
                <button style={{
                    padding: "10px",
                    border: "1px solid black",
                    background: "lightgray"
                }} onClick={() => deposit(convertToBasicUnit(document.getElementById("aquant").value.toString(), a_d),
                    convertToBasicUnit(document.getElementById("bquant").value.toString(), b_d))}>Deposit</button>
            </div>
            <div>
                LP:
                <input type="number" id="lpquant"></input>
                <button style={{
                    padding: "10px",
                    border: "1px solid black",
                    background: "lightgray"
                }} onClick={() => withdraw(convertToBasicUnit(document.getElementById("lpquant").value.toString(), lp_d))}>Withdraw</button>
            </div>
        </div>
    );
};

export default Dex;