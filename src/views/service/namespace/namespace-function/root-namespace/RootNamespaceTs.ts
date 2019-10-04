import {mapState} from "vuex"
import {PublicAccount, MultisigAccountInfo, NetworkType, Address} from "nem2-sdk"
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs.ts"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {Message, networkConfig, DEFAULT_FEES, FEE_GROUPS, defaultNetworkConfig, formDataConfig} from "@/config"
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {
    getAbsoluteMosaicAmount, formatSeconds, formatAddress,
} from '@/core/utils'
import {formDataConfig} from '@/config/view/form'
import {rootNamespaceTypeConfig} from "@/config/view/namespace";
import {createBondedMultisigTransaction, createCompleteMultisigTransaction} from "@/core/model"
import {defaultNetworkConfig} from '@/config'

@Component({
    components: {
        CheckPWDialog
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app'
        })
    }
})
export class RootNamespaceTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    transactionDetail = {}
    isCompleteForm = false
    currentMinApproval = -1
    durationIntoDate: any = 0
    showCheckPWDialog = false
    transactionList = []
    otherDetails: any = {}
    typeList = rootNamespaceTypeConfig
    formItems = formDataConfig.rootNamespaceForm

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

    get address(): string {
        return this.activeAccount.wallet.address
    }

    get networkType(): NetworkType {
        return this.activeAccount.wallet.networkType
    }

    get xemDivisibility(): number {
        return this.activeAccount.xemDivisibility
    }

    initForm() {
        this.formItems = formDataConfig.rootNamespaceForm
    }

    initForm(): void {
        this.formItems = formDataConfig.rootNamespaceForm
    }

    get multisigAccountInfo(): MultisigAccountInfo {
        return this.activeAccount.multisigAccountInfo[this.wallet.address]
    }

    get accountPublicKey(): string {
        return this.activeAccount.wallet.publicKey
    }

    get multisigAccounts(): PublicAccount[] {
        return this.multisigAccountInfo ? this.multisigAccountInfo.multisigAccounts : []
    }

    get defaultFees(): DefaultFee[] {
        if (!this.activeMultisigAccount) return DEFAULT_FEES[FEE_GROUPS.SINGLE]
        if (!this.announceInLock) return DEFAULT_FEES[FEE_GROUPS.DOUBLE]
        if (this.announceInLock) return DEFAULT_FEES[FEE_GROUPS.TRIPLE]
    }

    get defaultFees() {
      const {defaultFeesWithLock, defaultAggregateFees} = defaultNetworkConfig
      return this.typeList[0].isSelected ? defaultFeesWithLock : defaultAggregateFees
    }

    get feeAmount() {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    formatAddress(address) {
        return formatAddress(address)
    }

    get feeDivider(): number {
        if (!this.activeMultisigAccount) return 1
        if (!this.announceInLock) return 2
        if (this.announceInLock) return 3
    }

    async createBySelf() {
        let transaction = this.createRootNamespace()
        this.transactionList = [transaction]
    }

    createByMultisig() {
        const {feeAmount} = this
        let {duration, rootNamespaceName, multisigPublickey} = this.formItems
        const {networkType} = this.wallet
        const aggregateFee = feeAmount/3
        const innerFee = feeAmount/3
        const rootNamespaceTransaction = new NamespaceApiRxjs().createdRootNamespace(
            rootNamespaceName,
            duration,
            networkType,
            innerFee
        )
        if (this.currentMinApproval > 1) {
            const aggregateTransaction = createBondedMultisigTransaction(
                [rootNamespaceTransaction],
                multisigPublicKey,
                networkType,
                aggregateFee
            )

            this.transactionList = [aggregateTransaction]
            return
        }
        const aggregateTransaction = createCompleteMultisigTransaction(
            [rootNamespaceTransaction],
            multisigPublicKey,
            networkType,
            aggregateFee
        )
        this.transactionList = [aggregateTransaction]
    }

    async checkEnd(isPasswordRight) {
        if (!isPasswordRight) {
            this.$Notice.destroy()
            this.$Notice.error({
                title: this.$t(Message.WRONG_PASSWORD_ERROR) + ''
            })
        }
    }

    createRootNamespace() {
        const {networkType} =  this.wallet
        const {rootNamespaceName, duration} = this.formItems
        const {feeAmount} = this
        return new NamespaceApiRxjs().createdRootNamespace(rootNamespaceName, duration, networkType, feeAmount)
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = false
    }

    checkForm(): boolean {
        const {duration, rootNamespaceName, multisigPublickey} = this.formItems

        // check multisig
        if (this.hasMultisigAccounts) {
            if (!multisigPublicKey) {
                this.$Notice.error({
                    title: this.$t(Message.INPUT_EMPTY_ERROR) + ''
                })
                return false
            }
        }

        if (!Number(duration) || Number(duration) < 0) {
            this.showErrorMessage(this.$t(Message.DURATION_VALUE_LESS_THAN_1_ERROR))
            return false
        }

        if (!rootNamespaceName || !rootNamespaceName.trim()) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_NULL_ERROR))
            return false
        }

        if (rootNamespaceName.length > 16) {
            this.showErrorMessage(this.$t(Message.ROOT_NAMESPACE_TOO_LONG_ERROR))
            return false
        }

        if (!rootNamespaceName.match(/^[a-z].*/)) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_STARTING_ERROR))
            return false
        }
        if (!rootNamespaceName.match(/^[0-9a-zA-Z_-]*$/g)) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_FORMAT_ERROR))
            return false
        }

        //reservedRootNamespaceNames
        const flag = networkConfig.reservedRootNamespaceNames.every((item) => {
            if (item == rootNamespaceName) {
                this.showErrorMessage(this.$t(Message.NAMESPACE_USE_BANNED_WORD_ERROR))
                return false
            }
            return true
        })
        return flag
    }

    showErrorMessage(message) {
        this.$Notice.destroy()
        this.$Notice.error({
            title: message
        })
    }

    createTransaction() {
        if (!this.isCompleteForm) return
        if (!this.checkForm()) return
        const {feeAmount} = this
        const {address} = this.wallet
        const {duration, rootNamespaceName} = this.formItems
        const feeDivider = this.typeList[0].isSelected ? 2 : 3
        this.transactionDetail = {
            "address": address,
            "duration": duration,
            "namespace": rootNamespaceName,
            "fee": feeAmount/feeDivider
        }
        this.otherDetails = {
            lockFee: feeAmount/feeDivider
        }

        if (this.activeMultisigAccount) {
            this.createByMultisig()
            this.showCheckPWDialog = true
            return
        }

        this.createBySelf()
        this.showCheckPWDialog = true
    }

    // @TODO: target blockTime is hardcoded
    changeXEMRentFee() {
        const duration = Number(this.formItems.duration)
        if (Number.isNaN(duration)) {
            this.formItems.duration = 0
            this.durationIntoDate = 0
            return
        }
        if (duration * 12 >= 60 * 60 * 24 * 365) {
            this.showErrorMessage(this.$t(Message.DURATION_MORE_THAN_1_YEARS_ERROR) + '')
            this.formItems.duration = 0
        }
        this.durationIntoDate = formatSeconds(duration * 12)
    }

    @Watch('formItems', {immediate: true, deep: true})
    onFormItemChange() {
        const {duration, rootNamespaceName, multisigPublickey} = this.formItems

        // isCompleteForm
        if (this.typeList[0].isSelected) {
            this.isCompleteForm = duration + '' !== '' && rootNamespaceName !== ''
            return
        }
        this.isCompleteForm = duration + '' !== '' && rootNamespaceName !== '' && multisigPublickey && multisigPublickey.length === 64
    }
}
