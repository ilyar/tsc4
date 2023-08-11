import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task5 } from '../wrappers/Task5';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task5', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task5');
    });

    let blockchain: Blockchain;
    let task5: SandboxContract<Task5>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task5 = blockchain.openContract(Task5.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task5.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task5.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task5 are ready to use
    });

    it('empty case', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(201n, 0n);
        expect(out).toEqual([]);
        expect(gasUsed).toEqual(415n);
    });

    it('base case', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(201n, 4n);
        expect(out).toEqual([
            453973694165307953197296969697410619233826n,
            734544867157818093234908902110449296423351n,
            1188518561323126046432205871807859915657177n,
            1923063428480944139667114773918309212080528n,
        ]);
        expect(gasUsed).toEqual(14742n);
    });

    // sequence from N to N+K terms (0<=N<=370; 0<=N+K<=371; 0<=K<=255)
    const maxN = 370n;
    const maxK = 255n;
    const maxNK = 371n;

    it('max N case', async () => {
        const { out, gasUsed } = await task5.getFibonacciSequence(maxN, 0n);
        expect(out).toEqual([]);
        expect(gasUsed).toEqual(415n);
    });

    it('max NK case', async () => {
        const { out, gasUsed } = await task5.getFibonacciSequence(maxNK - 1n, 1n);
        expect(out).toEqual([
            94611056096305838013295371573764256526437182762229865607320618320601813254535n,
        ]);
        expect(gasUsed).toEqual(25526n);
    });

    it('max K case', async () => {
        const { out, gasUsed } = await task5.getFibonacciSequence(maxNK - maxK, maxK);
        expect(out.length).toEqual(255);
        expect(out.shift()).toEqual(781774079430987230203437n);
        expect(out.pop()).toEqual(94611056096305838013295371573764256526437182762229865607320618320601813254535n);
        expect(gasUsed).toEqual(67530n);
    });
});
