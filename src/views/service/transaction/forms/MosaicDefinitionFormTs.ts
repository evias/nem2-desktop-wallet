import {mapState} from "vuex"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {
    Account,
    MosaicId,
    MosaicNonce,
    PublicAccount,
    MosaicDefinitionTransaction,
    MosaicSupplyChangeTransaction,
    Deadline,
    UInt64,
    MosaicFlags,
    Transaction,
    MosaicSupplyChangeAction,
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
        supply: 500000000,
        divisibility: 0,
        transferable: true,
        supplyMutable: true,
        restrictable: false,
        permanent: false,
        duration: 1000,
    })
})
export class MosaicDefinitionFormTs extends TransactionFormTs {
    activeAccount: StoreAccount

    prepareTransactions(): Array<Transaction> {

        // verify payload content
        const nonce = MosaicNonce.createRandom()
        const definitionTx = MosaicDefinitionTransaction.create(
            Deadline.create(),
            nonce,
            MosaicId.createFromNonce(nonce, this.signerAccount as PublicAccount),
            MosaicFlags.create(
                this.supplyMutable,
                this.transferable,
                this.restrictable
            ),
            this.divisibility,
            UInt64.fromUint(this.duration),
            this.networkType,
            UInt64.fromUint(2000000)
        )

        const supplyTx = MosaicSupplyChangeTransaction.create(
            Deadline.create(),
            definitionTx.mosaicId,
            MosaicSupplyChangeAction.Increase,
            UInt64.fromUint(this.supply),
            this.networkType,
            UInt64.fromUint(2000000)
        );

        this.transactionList.push(definitionTx)
        this.transactionList.push(supplyTx)
        return this.transactionList;
    }

    resetForm() {
        super.resetForm()

        this.supply = 500000000
        this.divisibility = 0
        this.transferable = true
        this.supplyMutable = true
        this.restrictable = false
        this.permanent = false
        this.duration = 1000
    }
}
