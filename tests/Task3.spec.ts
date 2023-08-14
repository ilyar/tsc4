import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, Builder } from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task3', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task3');
    });

    let blockchain: Blockchain;
    let task3: SandboxContract<Task3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task3 = blockchain.openContract(Task3.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task3.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task3 are ready to use
    });

    it('match case', async () => {
        const set = [
          [[0b101110100, 0b11100010100], [0, 0]],
          [[0b101110101, 0b10100001011], [0, 3]],
          [[0b101110101, 0b101011011], [0, 5]],
          [[0b1011101, 0b1010101011101010101], [6, 7]],
          [[0b101110101, 0b10111010110], [0, 9]],
          [[0b101110101, 0b101110101], [0, 9]],
        ]
        for (const x of set) {
            const { out, gasUsed} = await task3.getMatch(
              x[0][0],
              x[0][1],
            );
            expect(out).toEqual(x[1]);
        }
    });

    // te6cckEBAgEACQABBAULAQAEqPwr+71u
    const base = (new Builder).storeUint(0b0000010100001011, 16).storeRef(
      (new Builder).storeUint(0b1010100011111100, 16).endCell()
    ).endCell()
    // te6cckEBAgEACQABBAUPAQAE+PzZ+5oc
    const target = (new Builder).storeUint(0b0000010100001111, 16).storeRef(
      (new Builder).storeUint(0b1111100011111100, 16).endCell()
    ).endCell()
    it('base case', async () => {
        const { out, gasUsed} = await task3.getFindAndReplace(
          BigInt(0b101110101),
          BigInt(0b111111111),
          base
        );
        expect(out.toBoc().toString('base64')).toEqual(target.toBoc().toString('base64'));
        expect(gasUsed).toEqual(10048n);
    });
});
