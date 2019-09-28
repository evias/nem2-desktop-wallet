import {mapState} from "vuex"
import {PublicAccount, MultisigAccountInfo} from "nem2-sdk"
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs.ts"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {Message, networkConfig} from "@/config/index.ts"
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {
    getAbsoluteMosaicAmount, formatSeconds, formatAddress,
} from '@/core/utils'
import {formDataConfig} from '@/config/view/form'
import {rootNamespaceTypeConfig} from "@/config/view/namespace";
import {createBondedMultisigTransaction, createCompleteMultisigTransaction, StoreAccount, AppInfo} from "@/core/model"
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

    get generationHash() {
        return this.activeAccount.generationHash
    }

    get node() {
        return this.activeAccount.node
    }

    get wallet() {
        return this.activeAccount.wallet
    }

    get address() {
        return this.activeAccount.wallet.address
    }

    get xemDivisibility() {
        return this.activeAccount.xemDivisibility
    }

    initForm() {
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
    
    get multisigPublickeyList(): any {
        const {multisigAccounts} = this
        const {accountPublicKey} = this
        const mainPublicKeyItem = {
            value: accountPublicKey,
            label: '(self)' + accountPublicKey
        }

        return [mainPublicKeyItem, ...multisigAccounts
            .map(({publicKey}) => ({value: publicKey, label: publicKey}))]
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

    switchAccountType(index) {
        this.initForm()
        let list = this.typeList
        list = list.map((item) => {
            item.isSelected = false
            return item
        })
        list[index].isSelected = true
        this.typeList = list
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
                multisigPublickey,
                networkType,
                aggregateFee
            )

            this.transactionList = [aggregateTransaction]
            return
        }
        const aggregateTransaction = createCompleteMultisigTransaction(
            [rootNamespaceTransaction],
            multisigPublickey,
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
        if (this.typeList[1].isSelected) {
            if (!multisigPublickey) {
                this.$Notice.error({
                    title: this.$t(Message.INPUT_EMPTY_ERROR) + ''
                })
                return false
            }
        }

        //check common
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

        //^[a-z].*
        if (!rootNamespaceName.match(/^[a-z].*/)) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_STARTING_ERROR))
            return false
        }
        //^[0-9a-zA-Z_-]*$
        if (!rootNamespaceName.match(/^[0-9a-zA-Z_-]*$/g)) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_FORMAT_ERROR))
            return false
        }

        //reservedRootNamespaceNames
        const flag = networkConfig.reservedRootNamespaceNames.every((item) => {
            if (item == rootNamespaceName) {
                this.showErrorMessage(this.$t(Message.NAMESPACE_USE_BANDED_WORD_ERROR))
                return false
            }
            return true
        })
        return flag
    }

    @Watch('formItem.multisigPublickey')
    onMultisigPublickeyChange(newPublicKey, oldPublicKey) {
        if (!newPublicKey || newPublicKey === oldPublicKey) return
        this.$store.commit('SET_ACTIVE_MULTISIG_ACCOUNT', newPublicKey)
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
        if (this.typeList[0].isSelected) {
            this.createBySelf()
        } else {
            this.createByMultisig()
        }
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
