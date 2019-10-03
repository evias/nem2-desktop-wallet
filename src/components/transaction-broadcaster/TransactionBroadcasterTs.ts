import {mapState} from "vuex"
import {
    Mosaic,
    SignedTransaction,
    TransactionHttp,
    Listener,
    PublicAccount,
} from "nem2-sdk"
import {Component, Vue, Prop} from 'vue-property-decorator'
import {filter, mergeMap} from "rxjs/operators"
import {from as observableFrom} from "rxjs"

// internal dependencies
import {Message} from "@/config/index.ts"
import {AppWallet, StoreAccount} from "@/core/model"

class OrderedSignedTransactionList extends Array<Array<SignedTransaction>> {}

@Component({
    computed: {...mapState({activeAccount: 'account'})},
})
export class TransactionBroadcasterTs extends Vue {
    stepIndex = 0
    show = false
    activeAccount: StoreAccount
    formModel = {
        password: ''
    }

    @Prop({default: () => this.activeAccount.node})
    node: string

    @Prop({default: () => this.activeAccount.generationHash})
    generationHash: string

    @Prop({default: () => []})
    signedTransactions: OrderedSignedTransactionList

    @Prop({default: () => null})
    signerAccount: PublicAccount

    @Prop({default: () => 0})
    hashLockFee: number

    @Prop({default: () => null})
    hashLockMosaic: Mosaic

    @Prop({default: () => 480}) // blocks
    hashLockDuration: number

    async mounted() {
        // broadcaster only broadcasts passed transactions
        this.broadcast()
    }

    broadcast(): Boolean {
        this.signedTransactions.map((signedTx: Array<SignedTransaction>) => {
            this.broadcastTransaction(signedTx)
        })

        return true
    }

    broadcastTransaction(signedTransactions: Array<SignedTransaction>) {

        if (signedTransactions.length === 2) {
            // we have a hash lock transaction prepended to an aggregate bonded
            // we first need to broadcast the hash lock transaction
            return this.announceBondedWithLock(signedTransactions)
        }

        return this.announceTransaction(signedTransactions[0])
    }

    announceTransaction(signedTransaction: SignedTransaction) {
        return observableFrom(new TransactionHttp(this.node).announce(signedTransaction))
    }

    async announceBondedWithLock(signedTransactions: Array<SignedTransaction>) {
        const listener = new Listener(this.node.replace('http', 'ws'), WebSocket)
        const transactionHttp = new TransactionHttp(this.node)

        //@TODO could validate transaction types after createFromPayload
        const hashLockTx = signedTransactions[0];
        const aggregateTx = signedTransactions[1];

        // make sure to only broadcast when connected
        return listener.open().then(() => {
            transactionHttp.announce(hashLockTx)
                           .subscribe(
                status => console.log(status),
                err => {
                    this.$Notice.destroy()
                    this.$Notice.error({
                        title: err
                    })
                })

            // wait until hash lock is *confirmed* in a block
            listener.confirmed(this.signerAccount.address).pipe(
                filter((transaction) => {
                    // make sure to take only *hash lock* confirmation into account
                    return transaction.transactionInfo !== undefined
                        && transaction.transactionInfo.hash === hashLockTx.hash 
                }),
                mergeMap(ignored => {
                    // now announce aggregate bonded
                    return transactionHttp.announceAggregateBonded(aggregateTx)
                }),
            ).subscribe(announcedAggregateBonded => {
                this.$Notice.destroy()
                this.$Notice.success(this.$t(Message.SUCCESS_ANNOUNCED_TRANSACTION))
            },
            err => {
                this.$Notice.destroy()
                this.$Notice.error({
                    title: err
                })
            })
        });
    }

}
