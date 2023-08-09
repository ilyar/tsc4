import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Tuple } from 'ton-core';

export type Task2Config = {};

export function task2ConfigToCell(config: Task2Config): Cell {
    return beginCell().endCell();
}

function arrayToTuple(list: bigint[]): Tuple {
    return {
        type: 'tuple',
        items: list.map(item => {
            return { type: 'int', value: item };
        })
    };
}

function matrixToTuple(matrix: bigint[][]): Tuple {
    return { type: 'tuple', items: matrix.map(row => arrayToTuple(row))};
}

export class Task2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task2(address);
    }

    static createFromConfig(config: Task2Config, code: Cell, workchain = 0) {
        const data = task2ConfigToCell(config);
        const init = { code, data };
        return new Task2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getMatrixMultiplier(provider: ContractProvider, matrixA: bigint[][], matrixB: bigint[][]) {
        const result = await provider.get('matrix_multiplier', [
            matrixToTuple(matrixA),
            matrixToTuple(matrixB),
        ]);
        const reader = result.stack.readTuple();
        const out = Array<bigint[]>();
        while (reader.remaining > 0) {
            const inner = reader.readTuple()
            const item = Array<bigint>();
            while (inner.remaining > 0) {
                item.push(inner.readBigNumber());
            }
            out.push(item);
        }
        return {
            out,
            gasUsed: result.gasUsed,
        };
    }

}
