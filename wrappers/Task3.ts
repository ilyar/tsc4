import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type Task3Config = {};

export function task3ConfigToCell(config: Task3Config): Cell {
    return beginCell().endCell();
}

export class Task3 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task3(address);
    }

    static createFromConfig(config: Task3Config, code: Cell, workchain = 0) {
        const data = task3ConfigToCell(config);
        const init = { code, data };
        return new Task3(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getMatch(provider: ContractProvider, flag: number, data: number) {
        const result = await provider.get('match', [
            { type: 'int', value: BigInt(flag) },
            { type: 'int', value: BigInt(data) },
        ]);
        return {
            out: [
                Number(result.stack.readBigNumber()),
                Number(result.stack.readBigNumber()),
            ],
            gasUsed: result.gasUsed,
        };
    }

    async getFindAndReplace(provider: ContractProvider, flag: bigint, value: bigint, list: Cell) {
        const result = await provider.get('find_and_replace', [
            { type: 'int', value: flag },
            { type: 'int', value: value },
            { type: 'cell', cell: list },
        ]);
        return {
            out: result.stack.readCell(),
            gasUsed: result.gasUsed,
        };
    }
}
