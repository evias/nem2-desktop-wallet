import {mapState} from "vuex"
import {
    Account,
    Transaction,
    TransactionType,
    Password,
    SignedTransaction,
    HashLockTransaction,
    Mosaic,
    Deadline,
    UInt64,
} from "nem2-sdk"
import {Component, Vue, Prop} from 'vue-property-decorator'

// internal dependencies
import {Message} from "@/config/index.ts"
import {AppWallet, StoreAccount} from "@/core/model"

class OrderedSignedTransactionList extends Array<Array<SignedTransaction>> {}

@Component({
    computed: {...mapState({activeAccount: 'account'})},
})
export class TransactionSignerTs extends Vue {
    stepIndex = 0
    show = false
    activeAccount: StoreAccount
    formModel = {
        password: ''
    }

    @Prop({default: () => null})
    signerAccount: Account

    @Prop({default: () => ''})
    generationHash: string

    @Prop({default: () => []})
    transactionList: Array<Transaction>

    @Prop({default: () => 0})
    hashLockFee: number

    @Prop({default: () => null})
    hashLockMosaic: Mosaic

    async mounted() {
        // signer only signs passed transactions
        this.sign()
    }

    sign(): OrderedSignedTransactionList {

        // read environment
        const {node, generationHash, currentXEM1, xemDivisibility} = this.activeAccount
        const {transactionList} = this

        // unlock wallet
        const wallet = new AppWallet(this.activeAccount.wallet)
        const password = new Password(this.formModel.password)
        const account = wallet.getAccount(password)

        // array of array to permit work around of hashlock spam protection
        let orderedSignedTransactions: OrderedSignedTransactionList;

        // sign transactions
        transactionList.map((transaction) => {

            const signedTxes = this.signTransaction(transaction)
            orderedSignedTransactions.push(signedTxes);
        });

        // emit signed transactions
        this.$emit('transactionsSigned', orderedSignedTransactions);

        // notify success
        this.$Notice.success({
            title: this.$t(Message.SUCCESS_TRANSACTION_SIGNED) as string
        })

        return orderedSignedTransactions
    }

    signTransaction(transaction: Transaction): Array<SignedTransaction> {

        let signedTransactions: Array<SignedTransaction> = [];

        // do not add to array `signedTransactions`, first hash lock
        const signedTx = this.signerAccount.sign(transaction, this.generationHash)

        if (transaction.type === TransactionType.AGGREGATE_BONDED) {
            // create hashlock for aggregates
            const hashLock = HashLockTransaction.create(
                Deadline.create(),
                this.hashLockMosaic,
                UInt64.fromUint(480), // blocks
                signedTx,
                this.activeAccount.wallet.networkType,
                UInt64.fromUint(this.hashLockFee)
            )

            // sign hashlock
            const signedHashLock = this.signerAccount.sign(hashLock, this.activeAccount.generationHash);

            // first push the hashlock
            signedTransactions.push(signedHashLock)
        }

        // now push signed transaction
        signedTransactions.push(signedTx)
        return signedTransactions;
    }
}
