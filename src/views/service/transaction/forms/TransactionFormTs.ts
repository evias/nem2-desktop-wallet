
import {mapState} from "vuex"
import {Component, Provide, Vue, Watch} from 'vue-property-decorator'
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { 
    Account,
    SignedTransaction,
    Transaction, 
    PublicAccount,
    AggregateTransaction,
    Deadline,
} from 'nem2-sdk';

// internal dependencies
import { Message } from '@/config'
import { AppInfo, StoreAccount } from '@/core/model'
import FormInput from '@/views/other/forms/input/FormInput.vue'
import AccountUnlockDialog from '@/components/account-unlock-dialog/AccountUnlockDialog.vue'
import TransactionSigner from '@/components/transaction-signer/TransactionSigner.vue'
import TransactionBroadcaster from '@/components/transaction-broadcaster/TransactionBroadcaster.vue'
import SignerAccountSelect from '@/components/signer-account-select/SignerAccountSelect.vue'
import ValidatedForm from '@/components/validated-form/ValidatedForm.vue';

@Component({
    extends: ValidatedForm,
    components: {
        FormInput,
        ValidationProvider,
        ValidationObserver,
        AccountUnlockDialog,
        TransactionSigner,
        TransactionBroadcaster,
        SignerAccountSelect,
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app'
        })
    },
    data: () => ({
        signerPublicKey: '',
        fee: 0,
    }),
})
export class TransactionFormTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    signerAccount: Account | PublicAccount
    transactionList: Array<Transaction> = []
    signedTransactions: Array<Array<SignedTransaction>> = []
    networkType = this.activeAccount.wallet.networkType

    // form state change variables
    mustUnlockAccount: Boolean = false
    canSignTransactions: Boolean = false
    canBroadcastTransactions: Boolean = false
    // end state changes

    mounted() {}

    get shouldPrepareMultisigTransaction() {
        return this.signerAccount 
            && this.signerAccount.publicKey != this.activeAccount.wallet.publicKey
    }

    get feeMultiplier() {
        // double transaction fee if aggregate
        return shouldPrepareMultisigTransaction ? 2 : 1
    }

    onSubmit() {

        // prepare resulting transactions
        this.transactionList = this.prepareTransactions()

        // in case of multi-signature transaction, wrap in aggregate bonded
        if (this.shouldPrepareMultisigTransaction) {
            this.transactionList = [].concat(this.prepareAggregate(this.transactionList))
        }

        // pass over to AccountUnlockDialog
        this.mustUnlockAccount = true
    }

    prepareTransactions(): Array<Transaction> {
        throw new Error("prepareTransactions() must be overloaded in specialized transaction forms.");
    }

    resetForm() {
        this.signerPublicKey = this.activeAccount.wallet.publicKey
        this.fee = 0
    }

    prepareAggregate(transactions: Array<Transaction>): AggregateTransaction {

        const embedded = transactions.map(
            (transaction) => transaction.toAggregate(this.signerAccount as PublicAccount))

        // create bonded aggregate
        const bonded = AggregateTransaction.createBonded(
            Deadline.create(),
            embedded,
            this.networkType,
            []
        )

        return bonded
    }

/**
 * State Changes
 */

    @Watch('signerAccountChanged')
    onSignerAccountChanged(signerPublicKey) {
        const networkType = this.activeAccount.wallet.networkType
        this.signerPublicKey = signerPublicKey
        this.signerAccount = PublicAccount.createFromPublicKey(signerPublicKey, networkType)
    }

    @Watch('accountUnlocked')
    onAccountUnlocked(account: Account) {
        // forward to TransactionSigner
        this.signerAccount = account
        this.canSignTransactions = true
    }

    @Watch('transactionsSigned')
    onTransactionsSigned(transactions: Array<Array<SignedTransaction>>) {

        // forward to TransactionBroadcaster
        this.signedTransactions = transactions

        // remove sensitive data from account instance
        this.signerAccount = (this.signerAccount as Account).publicAccount
        this.canBroadcastTransactions = true
    }
}
