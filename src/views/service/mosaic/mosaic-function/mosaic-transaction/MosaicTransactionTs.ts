import {mapState} from "vuex"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {
    MosaicId,
    MosaicNonce,
    PublicAccount,
    MosaicDefinitionTransaction,
    MosaicFlags,
    Deadline,
    UInt64,
    MosaicSupplyChangeTransaction,
    MosaicSupplyChangeAction
} from 'nem2-sdk'
import {MosaicApiRxjs} from '@/core/api/MosaicApiRxjs.ts'
import {
    formatSeconds, formatAddress, getAbsoluteMosaicAmount,
} from '@/core/utils'
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {formDataConfig} from "@/config/view/form";
import {mosaicTransactionTypeConfig} from '@/config/view/mosaic'
import {createBondedMultisigTransaction, createCompleteMultisigTransaction} from "@/core/model"


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
    transactionDetail = {}
    showCheckPWDialog = false
    transactionList = []
    isCompleteForm = true
    formItems = formDataConfig.mosaicTransactionForm
    XEM: string = defaultNetworkConfig.XEM
    formatAddress = formatAddress

    get wallet(): AppWallet {
        return this.activeAccount.wallet
    }

    get activeMultisigAccount(): string {
        return this.activeAccount.activeMultisigAccount
    }

    get announceInLock(): boolean {
        const {activeMultisigAccount, networkType} = this
        if (!this.activeMultisigAccount) return false
        const address = Address.createFromPublicKey(activeMultisigAccount, networkType).plain()
        return this.activeAccount.multisigAccountInfo[address].minApproval > 1
    }

    get multisigInfo(): MultisigAccountInfo {
        const {address} = this.wallet
        return this.activeAccount.multisigAccountInfo[address]
    }

    get hasMultisigAccounts(): boolean {
        if (!this.multisigInfo) return false
        return this.multisigInfo.multisigAccounts.length > 0
    }

    get multisigPublicKeyList(): {publicKey: string, address: string}[] {
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
        if (!this.activeMultisigAccount) return DEFAULT_FEES[FEE_GROUPS.SINGLE]
        if (!this.announceInLock) return DEFAULT_FEES[FEE_GROUPS.DOUBLE]
        if (this.announceInLock) return DEFAULT_FEES[FEE_GROUPS.TRIPLE]
    }

    get feeAmount(): number {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    get feeDivider(): number {
        if (!this.activeMultisigAccount) return 1
        if (!this.announceInLock) return 2
        if (this.announceInLock) return 3
    }

    get durationIntoDate(): string {
        const duration = Number(this.formItems.duration)
        if (Number.isNaN(duration)) {
            this.formItems.duration = 0
            return ''
        }
        if (duration * 12 >= 60 * 60 * 24 * 3650) {
            this.$Notice.error({
                title: this.$t(Message.DURATION_MORE_THAN_10_YEARS_ERROR) + ''
            })
            this.formItems.duration = 0
        }
        return formatSeconds(duration * 12)
    }

    initForm(): void {
        this.formItems = formDataConfig.mosaicTransactionForm
        this.formItems.multisigPublicKey = this.accountPublicKey
    }

    addDivisibilityAmount() {
        this.formItems.divisibility = this.formItems.divisibility >= NETWORK_PARAMS.MAX_MOSAIC_DIVISIBILITY
            ? Number(this.formItems.divisibility) : Number(this.formItems.divisibility) + 1
    }

    cutDivisibilityAmount() {
        this.formItems.divisibility = this.formItems.divisibility >= 1 ? Number(this.formItems.divisibility - 1) : Number(this.formItems.divisibility)
    }

    addSupplyAmount() {
        this.formItems.supply = this.formItems.supply >= NETWORK_PARAMS.MAX_MOSAIC_ATOMIC_UNITS
            ? Number(this.formItems.supply) : Number(this.formItems.supply) + 1
    }

    cutSupplyAmount() {
        this.formItems.supply = this.formItems.supply >= 2 ? Number(this.formItems.supply - 1) : Number(this.formItems.supply)
    }

    showCheckDialog() {
        const {supply, divisibility, transferable, permanent, supplyMutable, restrictable, duration} = this.formItems
        const {address, feeAmount, xemDivisibility} = this
        this.transactionDetail = {
            "address": address,
            "supply": supply,
            "mosaic_divisibility": divisibility,
            "duration": duration,
            "fee": feeAmount / Math.pow(10,xemDivisibility),
            'transmittable': transferable,
            'variable_supply': supplyMutable,
            "duration_permanent": permanent,
            "restrictable": restrictable
        }

        if (this.announceInLock) {
            this.otherDetails = {
                lockFee: feeAmount / 3
            }
        }

        if (this.activeMultisigAccount) {
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
        const fee = feeAmount
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
                Number(fee))
        ]
        that.initForm()
    }

    createByMultisig() {
        const {networkType, xemDivisibility} = this
        const {
            supply, divisibility, transferable, supplyMutable,
            duration, innerFee, aggregateFee, multisigPublickey, restrictable,
        } = this.formItem

        const absoluteInnerFee = getAbsoluteMosaicAmount(innerFee, xemDivisibility)
        const absoluteAggregateFee = getAbsoluteMosaicAmount(aggregateFee, xemDivisibility)

        const that = this
        const nonce = MosaicNonce.createRandom()
        const mosaicId = MosaicId.createFromNonce(nonce, PublicAccount.createFromPublicKey(multisigPublickey, this.wallet.networkType))
        const mosaicDefinitionTx = MosaicDefinitionTransaction
            .create(
                Deadline.create(),
                nonce,
                mosaicId,
                MosaicFlags.create(supplyMutable, transferable, restrictable), 
                divisibility,
                duration ? UInt64.fromUint(duration) : undefined,
                networkType,
                absoluteInnerFee ? UInt64.fromUint(absoluteInnerFee) : undefined
            )

        const mosaicSupplyChangeTx = MosaicSupplyChangeTransaction.create(
            Deadline.create(),
            mosaicDefinitionTx.mosaicId,
            MosaicSupplyChangeAction.Increase,
            UInt64.fromUint(supply),
            networkType
        )

        if (this.announceInLock) {
            const aggregateTransaction = createBondedMultisigTransaction(
                [mosaicDefinitionTx, mosaicSupplyChangeTx],
                multisigPublicKey,
                networkType,
                absoluteAggregateFee
            )
            this.transactionList = [aggregateTransaction]
            return
        }
        const aggregateTransaction = createCompleteMultisigTransaction(
            [mosaicDefinitionTx, mosaicSupplyChangeTx],
            multisigPublicKey,
            networkType,
            absoluteAggregateFee,
        )
        this.transactionList = [aggregateTransaction]
    }

    checkForm() {
        const {supply, divisibility, duration, multisigPublicKey} = this.formItems
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

    getMultisigAccountList() {
        const that = this
        if (!this.wallet) return
        const {address, node} = this
        new MultisigApiRxjs().getMultisigAccountInfo(address, node).subscribe((multisigInfo) => {
            that.multisigPublickeyList = multisigInfo.multisigAccounts.map((item: any) => {
                item.value = item.publicKey
                item.label = item.publicKey
                return item
            })
        })
    }

    @Watch('formItem.multisigPublickey')
    async onMultisigPublickeyChange() {
        const that = this
        const {multisigPublickey} = this.formItem
        if (multisigPublickey.length !== 64) {
            return
        }
        if (multisigPublickey.length !== 64) {
            return
        }
        const {node, networkType} = this
        let address = Address.createFromPublicKey(multisigPublickey, networkType)['address']
        const multisigInfo = multisigAccountInfo(address, node)
        that.currentMinApproval = multisigInfo['minApproval']
    }

    initData() {
        this.durationChange()
    }

    // @TODO: Quickfix before vee-validate
    @Watch('formItems.divisibility')
    onDivisibilityChange(newVal) {
        const {MAX_MOSAIC_DIVISIBILITY} = NETWORK_PARAMS
        if (newVal > MAX_MOSAIC_DIVISIBILITY) this.formItems.divisibility = MAX_MOSAIC_DIVISIBILITY
        if (newVal < 0) this.formItems.divisibility = 0
    }

    mounted() {
        this.formItems.multisigPublicKey = this.accountPublicKey
    }
}
