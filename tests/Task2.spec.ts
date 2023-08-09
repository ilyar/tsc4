import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task2 } from '../wrappers/Task2';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task2', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task2');
    });

    let blockchain: Blockchain;
    let task2: SandboxContract<Task2>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task2 = blockchain.openContract(Task2.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task2 are ready to use
    });

    it('base case', async () => {
        const { out, gasUsed} = await task2.getMatrixMultiplier(
          [[1n, 2n],[4n, 5n]],
          [[6n, 5n], [3n, 2n]],
        );
        expect(out).toEqual([[12n, 9n], [39n, 30n]]);
        expect(gasUsed).toEqual(5838n);
    });

    it('different side case', async () => {
        const { out, gasUsed} = await task2.getMatrixMultiplier(
          [[1n, 2n],[3n, 4n], [5n, 6n]],
          [[1n, 2n, 3n], [4n, 5n, 6n]],
        );
        expect(out).toEqual([[9n, 12n, 15n], [19n, 26n, 33n], [29n, 40n, 51n]]);
        expect(gasUsed).toEqual(12164n);
    });
});
