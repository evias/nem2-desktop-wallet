import {mapState} from "vuex"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {
    Account,
    Mosaic,
    NamespaceId,
    PublicAccount,
    TransferTransaction,
    PlainMessage,
    EmptyMessage,
    Deadline,
    UInt64,
    Transaction,
} from 'nem2-sdk'
import {MosaicApiRxjs} from '@/core/api/MosaicApiRxjs.ts'
import {
    formatSeconds, formatAddress, getAbsoluteMosaicAmount,
} from '@/core/utils'
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {defaultNetworkConfig, formDataConfig, Message, FEE_SPEEDS, DEFAULT_FEES, FEE_GROUPS} from '@/config'
import {createBondedMultisigTransaction, createCompleteMultisigTransaction, StoreAccount, AppWallet, DefaultFee} from "@/core/model"
import {NETWORK_PARAMS} from '@/core/validation'

// internal dependencies
import { TransactionFormTs } from './TransactionFormTs';
import TransactionForm from './TransactionForm.vue';

@Component({
    extends: TransactionForm,
    props: {
        isEmbedded: Boolean
    },
    data: () => ({
        recipient: '',
        mosaics: [],
        message: '',
    })
})
export class TransferFormTs extends TransactionFormTs {
    activeAccount: StoreAccount

    prepareTransactions(): Array<Transaction> {

        // prepare attachments
        const sentMosaics = mosaics.map((mosaicAmountView) => {
            return new Mosaic(mosaicAmountView.mosaicInfo.id, mosaicAmountView.amount)
        })
        const formatMessage = !this.message.length ? new EmptyMessage() : PlainMessage.create(this.message)

        // prepare transaction
        const transferTx = TransferTransaction.create(
            Deadline.create(),
            Address.createFromRawAddress(this.recipient),
            sentMosaics,
            formatMessage,
            this.networkType,
            this.fee
        )

        this.transactionList.push(transferTx)
        return this.transactionList;
    }

    resetForm() {
        super.resetForm()

        this.recipient = ''
        this.mosaics = []
        this.message = ''
    }
}
