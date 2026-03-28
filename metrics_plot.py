import json
import matplotlib.pyplot as plt

def plot(y, y_label, title, labels=None):
    plt.figure(figsize=(6, 4))
    time = [i for i in range(len(y))]
    if type(y[0]) == list:
        for i in range(len(y[0])):
            plt.plot(time, [x[i] for x in y], label=labels[i])
    else:
        plt.plot(time, y)
    plt.title(title)
    plt.xlabel("Transaction Number")
    plt.ylabel(y_label)
    if labels:
        plt.legend()
    plt.show()

# Open and read JSON file
with open('metrics.json', 'r', encoding='utf-8') as file:
    data = json.load(file)
    plot([float(x) for x in data["Liquidity"]["Total Value Locked (TVL)"]], "TVL", "Total Value Locked (TVL) in Token A")
    plot([float(x) for x in data["Liquidity"]["Reserve Ratios"]], "RR", "Reserve Ratios (A/B)")
    plot([[float(y) for y in x] for x in data["Liquidity"]["LP Token Distribution"]], "LP Tokens", "LP Tokens Distribution",["LP1", "LP2", "LP3", "LP4", "LP5"])
    plot([[float(y) for y in x] for x in data["Trading Activity"]["Swap Volume"]], "Tokens", "Swap Volume", ["Token A", "Token B"])
    plot([[float(y) for y in x] for x in data["Trading Activity"]["Fee Accumulation"]], "Tokens", "Fee Accumulation", ["Token A", "Token B"])
    plot([float(x) for x in data["Price Dynamics"]["Spot Price"]], "Spot Price", "Spot Price (A per B)")
    plot([float(x[:len(x)-1]) for x in data["Price Dynamics"]["Slippage"]], "Slippage%", "Slippage")