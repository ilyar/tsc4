import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Builder, Cell, toNano } from 'ton-core'
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

function commentToCell(comment: string): Cell {
    return (new Builder)
        .storeUint(0,32)
        .storeStringTail(comment)
    .endCell()
}

function cellToBoc(cell: Cell): string {
    return cell.toBoc().toString('base64')
}

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    });

    const decrypted = commentToCell('Satoshi Nakamoto is a pseudonym for the person or people who helped develop the first bitcoin software and introduced the concept of cryptocurrency to the world in a 2008 paper. Nakamoto remained active in the creation of bitcoin and the blockchain until about 2010 but has not been heard from since.')
    const encrypted = commentToCell('Iqjeixy Dqaqceje yi q fiuktedoc veh jxu fuhied eh fuefbu mxe xubfut tulubef jxu vyhij ryjseyd ievjmqhu qdt ydjhetksut jxu sedsufj ev shofjeskhhudso je jxu mehbt yd q 2008 fqfuh. Dqaqceje hucqydut qsjylu yd jxu shuqjyed ev ryjseyd qdt jxu rbesasxqyd kdjyb qrekj 2010 rkj xqi dej ruud xuqht vhec iydsu.')

    it('encrypt case', async () => {
        const { out, gasUsed} = await task4.getCaesarCipherEncrypt(
          42,
          decrypted,
        );
        expect(cellToBoc(out)).toEqual(cellToBoc(encrypted));
        expect(gasUsed).toEqual(194806n);
    });

    it('decrypt case', async () => {
        const { out, gasUsed} = await task4.getCaesarCipherDecrypt(
          42,
          encrypted,
        );
        expect(cellToBoc(out)).toEqual(cellToBoc(decrypted));
        expect(gasUsed).toEqual(194886n);
    });
});

