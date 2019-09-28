import {mapState} from "vuex"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {
    MosaicId,
    MosaicNonce,
    PublicAccount,
    MosaicDefinitionTransaction,
    MosaicProperties,
    Deadline,
    UInt64,
    MosaicSupplyChangeTransaction,
    MosaicSupplyType,
    MultisigAccountInfo,
    Address,
    NetworkType
} from 'nem2-sdk'
import {MosaicApiRxjs} from '@/core/api/MosaicApiRxjs.ts'
import {
    formatSeconds, formatAddress, getAbsoluteMosaicAmount,
} from '@/core/utils'
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {defaultNetworkConfig, formDataConfig, Message, DEFAULT_FEES, FEE_GROUPS} from '@/config'
import {createBondedMultisigTransaction, createCompleteMultisigTransaction, StoreAccount, AppWallet, DefaultFee} from "@/core/model"

@Component({
    components: {
        CheckPWDialog
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class MosaicTransactionTs extends Vue {
    activeAccount: StoreAccount
    duration = 0
    otherDetails: any = {}
    durationIntoDate: any = 0
    currentMinApproval = -1
    transactionDetail = {}
    showCheckPWDialog = false
    isMultisigAccount = false
    transactionList = []
    isCompleteForm = true
    formItems = formDataConfig.mosaicTransactionForm
    XEM: string = defaultNetworkConfig.XEM
    formatAddress = formatAddress

    get wallet(): AppWallet {
        return this.activeAccount.wallet
    }

    get activeMultisigAccount(): string {
        return this.activeMultisigAccount
    }

    get multisigInfo(): MultisigAccountInfo {
        const {address} = this.wallet
        return this.activeAccount.multisigAccountInfo[address]
    }

    get hasMultisigAccounts(): boolean {
        if (!this.multisigInfo) return false
        return this.multisigInfo.multisigAccounts.length > 0
    }

    get multisigPublickeyList(): {publicKey: string, address: string}[] {
        if (!this.hasMultisigAccounts) return null
        return [
          {
            publicKey: this.accountPublicKey,
            address: `(self) ${formatAddress(this.address)}`,
          },
          ...this.multisigInfo.multisigAccounts
            .map(({publicKey}) => ({
                publicKey,
                address: formatAddress(Address.createFromPublicKey(publicKey, this.networkType).plain())
            })),
        ]
    }

    get networkType(): NetworkType {
        return this.activeAccount.wallet.networkType
    }

    get accountPublicKey(): string {
        return this.activeAccount.wallet.publicKey
    }

    get address(): string {
        return this.activeAccount.wallet.address
    }

    get xemDivisibility(): number {
        return this.activeAccount.xemDivisibility
    }

    get node(): string {
        return this.activeAccount.node
    }

    get defaultFees(): DefaultFee[] {
        return DEFAULT_FEES[FEE_GROUPS.SINGLE]
    }

    get feeAmount(): number {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    initForm(): void {
        this.formItems = formDataConfig.mosaicTransactionForm
        this.formItems.multisigPublickey = this.accountPublicKey
    }

    addSeverabilityAmount() {
        this.formItems.divisibility = Number(this.formItems.divisibility) + 1
    }

    cutSeverabilityAmount() {
        this.formItems.divisibility = this.formItems.divisibility >= 1 ? Number(this.formItems.divisibility - 1) : Number(this.formItems.divisibility)
    }

    addSupplyAmount() {
        this.formItems.supply = Number(this.formItems.supply + 1)
    }

    cutSupplyAmount() {
        this.formItems.supply = this.formItems.supply >= 2 ? Number(this.formItems.supply - 1) : Number(this.formItems.supply)
    }

    showCheckDialog() {
        const {supply, divisibility, transferable, permanent, supplyMutable, restrictable, duration} = this.formItems
        const {address, feeAmount} = this
        this.transactionDetail = {
            "address": address,
            "supply": supply,
            "mosaic_divisibility": divisibility,
            "duration": duration,
            "fee": feeAmount,
            'transmittable': transferable,
            'variable_supply': supplyMutable,
            "duration_permanent": permanent,
            "restrictable": restrictable
        }
        this.otherDetails = {
            lockFee: feeAmount / 3
        }
        if (this.isMultisigAccount) {
            this.createByMultisig()
            this.showCheckPWDialog = true
            return
        }
        this.createBySelf()
        this.showCheckPWDialog = true
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = false
    }

    checkEnd(isPasswordRight) {
        if (!isPasswordRight) {
            this.$Notice.destroy()
            this.$Notice.error({
                title: this.$t(Message.WRONG_PASSWORD_ERROR) + ''
            })
        }
    }

    createBySelf() {
        let {accountPublicKey, networkType, feeAmount} = this
        let {supply, divisibility, transferable, supplyMutable, duration, restrictable} = this.formItems
        const that = this
        const nonce = MosaicNonce.createRandom()
        const publicAccount = PublicAccount.createFromPublicKey(accountPublicKey, networkType)
        const mosaicId = MosaicId.createFromNonce(nonce, PublicAccount.createFromPublicKey(accountPublicKey, this.wallet.networkType))
        const innerFee = feeAmount / 3
        this.transactionList = [
            new MosaicApiRxjs().createMosaic(
                nonce,
                mosaicId,
                supplyMutable,
                transferable,
                Number(divisibility),
                this.formItems.permanent ? undefined : Number(duration),
                networkType,
                supply,
                publicAccount,
                restrictable,
                Number(innerFee))
        ]
        that.initForm()
    }


    createByMultisig() {
        const {networkType, feeAmount} = this
        const {supply, divisibility, transferable, supplyMutable, duration, multisigPublickey} = this.formItems
        const innerFee = feeAmount / 3
        const aggregateFee = feeAmount / 3
        const nonce = MosaicNonce.createRandom()
        const mosaicId = MosaicId.createFromNonce(nonce, PublicAccount.createFromPublicKey(multisigPublickey, this.wallet.networkType))
        const mosaicDefinitionTx = MosaicDefinitionTransaction.create(
            Deadline.create(),
            nonce,
            mosaicId,
            MosaicProperties.create({
                supplyMutable: supplyMutable,
                transferable: transferable,
                divisibility: divisibility,
                duration: duration ? UInt64.fromUint(duration) : undefined
            }),
            networkType,
            innerFee ? UInt64.fromUint(innerFee) : undefined
        )

        const mosaicSupplyChangeTx = MosaicSupplyChangeTransaction.create(
            Deadline.create(),
            mosaicDefinitionTx.mosaicId,
            MosaicSupplyType.Increase,
            UInt64.fromUint(supply),
            networkType
        )

        if (this.currentMinApproval > 1) {
            const aggregateTransaction = createBondedMultisigTransaction(
                [mosaicDefinitionTx, mosaicSupplyChangeTx],
                multisigPublickey,
                networkType,
                aggregateFee
            )
            this.transactionList = [aggregateTransaction]
            return
        }
        const aggregateTransaction = createCompleteMultisigTransaction(
            [mosaicDefinitionTx, mosaicSupplyChangeTx],
            multisigPublickey,
            networkType,
            aggregateFee,
        )
        this.transactionList = [aggregateTransaction]
    }

    checkForm() {
        const {supply, divisibility, duration, multisigPublickey} = this.formItems
        // multisigApi check
        if (this.isMultisigAccount) {
            if (!multisigPublickey) {
                this.$Notice.error({
                    title: this.$t(Message.INPUT_EMPTY_ERROR) + ''
                })
                return false
            }
        }
        // common check
        if (!Number(supply) || supply < 0) {
            this.$Notice.error({
                title: this.$t(Message.SUPPLY_LESS_THAN_0_ERROR) + ''
            })
            return false
        }
        if ((!Number(divisibility) && Number(divisibility) !== 0) || divisibility < 0) {
            this.$Notice.error({
                title: this.$t(Message.DIVISIBILITY_LESS_THAN_0_ERROR) + ''
            })
            return false
        }
        if (!Number(duration) || duration <= 0) {
            this.$Notice.error({
                title: this.$t(Message.DURATION_LESS_THAN_0_ERROR) + ''
            })
            return false
        }
        return true
    }

    submit() {
        if (!this.isCompleteForm) return
        if (!this.checkForm()) return
        this.showCheckDialog()
    }

    @Watch('formItems.multisigPublickey')
    @Watch('formItems.multisigPublickey')
    onMultisigPublickeyChange(newPublicKey, oldPublicKey) {
        if (!newPublicKey || newPublicKey === oldPublicKey) return
        this.$store.commit('SET_ACTIVE_MULTISIG_ACCOUNT', newPublicKey)
    }

    initData() {
        this.durationChange()
    }

    durationChange() {
        const duration = Number(this.formItems.duration)
        if (Number.isNaN(duration)) {
            this.formItems.duration = 0
            this.durationIntoDate = 0
            return
        }
        if (duration * 12 >= 60 * 60 * 24 * 3650) {
            this.$Notice.error({
                title: this.$t(Message.DURATION_MORE_THAN_10_YEARS_ERROR) + ''
            })
            this.formItems.duration = 0
        }
        this.durationIntoDate = formatSeconds(duration * 12)
    }

    mounted() {
        this.formItems.multisigPublickey = this.accountPublicKey
    }
}
