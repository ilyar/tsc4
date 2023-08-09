import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type Task5Config = {};

export function task5ConfigToCell(config: Task5Config): Cell {
    return beginCell().endCell();
}

export class Task5 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task5(address);
    }

    static createFromConfig(config: Task5Config, code: Cell, workchain = 0) {
        const data = task5ConfigToCell(config);
        const init = { code, data };
        return new Task5(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getFibonacciSequence(provider: ContractProvider, n: bigint, k: bigint) {
        const result = await provider.get('fibonacci_sequence', [
            { type: 'int', value: n },
            { type: 'int', value: k },
        ]);
        const reader = result.stack.readTuple();
        const out = Array<bigint>();
        while (reader.remaining > 0) {
            out.push(reader.readBigNumber());
        }
        return {
            out,
            gasUsed: result.gasUsed,
        };
    }
}
