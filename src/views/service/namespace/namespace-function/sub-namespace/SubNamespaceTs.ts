import {Address, PublicAccount, MultisigAccountInfo} from "nem2-sdk"
import {EmptyAlias} from "nem2-sdk/dist/src/model/namespace/EmptyAlias"
import {mapState} from "vuex"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {Message, networkConfig} from "@/config/index.ts"
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs.ts"
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {getAbsoluteMosaicAmount, formatAddress} from '@/core/utils'
import {subNamespaceTypeConfig} from "@/config/view/namespace";
import {createBondedMultisigTransaction, createCompleteMultisigTransaction, AppNamespace, StoreAccount, AppInfo} from "@/core/model"

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
export class SubNamespaceTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    durationIntoDate = 0
    isCompleteForm = true
    showCheckPWDialog = false
    otherDetails: any = {}
    transactionDetail = {}
    transactionList = []
    currentMinApproval = -1
    form = {
        rootNamespaceName: '',
        subNamespaceName: '',
        multisigPublickey: '',
        innerFee: .5,
        aggregateFee: .5,
        lockFee: 10,
    }

    typeList = subNamespaceTypeConfig
    namespaceGracePeriodDuration = networkConfig.namespaceGracePeriodDuration

    get wallet() {
        return this.activeAccount.wallet
    }

    get generationHash() {
        return this.activeAccount.generationHash
    }

    get node() {
        return this.activeAccount.node
    }

    get address() {
        return this.activeAccount.wallet.address
    }

    get NamespaceList() {
        return this.activeAccount.namespaces ? this.activeAccount.namespaces : []
    }

    get currentHeight() {
        return this.app.chainStatus.currentHeight
    }

    get activeNamespaceList() {
        const {currentHeight, namespaceGracePeriodDuration} = this
        // @TODO handle namespace list loading state
        return this.NamespaceList
            .filter(({alias, endHeight, levels}) => alias instanceof EmptyAlias && endHeight - currentHeight > namespaceGracePeriodDuration && levels < 3)
            .map(alias => ({label: alias.label, value: alias.label}))
    }

    get xemDivisibility() {
        return this.activeAccount.xemDivisibility
    }

    get accountPublicKey(): string {
        return this.activeAccount.wallet.publicKey
    }

    get multisigAccountInfo(): MultisigAccountInfo {
        return this.activeAccount.multisigAccountInfo[this.wallet.address]
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

    get activeMultisigAddress(): string {
        const {activeMultisigAccount} = this.activeAccount
        return activeMultisigAccount
            ? Address.createFromPublicKey(activeMultisigAccount, this.wallet.networkType).plain()
            : null
    }

    get multisigNamespaceList(): any {
        const {currentHeight, namespaceGracePeriodDuration, activeMultisigAddress} = this
        if (!activeMultisigAddress) return []
        const namespaces: AppNamespace[] = this.activeAccount.multisigAccountsNamespaces[activeMultisigAddress]
        console.log(this.activeAccount.multisigAccountsNamespaces, 'YYYYYYYYY', namespaces, activeMultisigAddress)
        if (!namespaces) return []
        return namespaces
            .filter(({alias, endHeight, levels}) => alias instanceof EmptyAlias
                && endHeight - currentHeight > namespaceGracePeriodDuration && levels < 3)
            .map(alias => ({label: alias.label, value: alias.label}))
    }

    formatAddress(address) {
        return formatAddress(address)
    }

    switchType(index) {
        let list = this.typeList
        list = list.map((item) => {
            item.isSelected = false
            return item
        })
        list[index].isSelected = true
        this.typeList = list
    }

    async checkEnd(isPasswordRight) {
        if (!isPasswordRight) {
            this.$Notice.destroy()
            this.$Notice.error({
                title: this.$t(Message.WRONG_PASSWORD_ERROR) + ''
            })
        }
    }

    showErrorMessage(message) {
        this.$Notice.destroy()
        this.$Notice.error({
            title: message
        })
    }

    createByMultisig() {
        const that = this
        let {aggregateFee, multisigPublickey} = this.form
        const {networkType} = this.wallet
        const {xemDivisibility} = this
        const rootNamespaceTransaction = this.createSubNamespace()
        aggregateFee = getAbsoluteMosaicAmount(aggregateFee, xemDivisibility)
        if (that.currentMinApproval > 1) {
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

    checkForm(): boolean {
        const {rootNamespaceName, innerFee, subNamespaceName} = this.form

        if (!rootNamespaceName || !rootNamespaceName.trim()) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_NULL_ERROR))
            return false
        }
        if (!subNamespaceName || !subNamespaceName.trim()) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_NULL_ERROR))
            return false
        }
        if (subNamespaceName.length > 64) {
            this.showErrorMessage(this.$t(Message.SUB_NAMESPACE_LENGTH_LONGER_THAN_64_ERROR))
            return false
        }
        //^[a-z].*
        if (!subNamespaceName.match(/^[a-z].*/)) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_STARTING_ERROR))
            return false
        }
        //^[0-9a-zA-Z_-]*$
        if (!subNamespaceName.match(/^[0-9a-zA-Z_-]*$/g)) {
            this.showErrorMessage(this.$t(Message.NAMESPACE_FORMAT_ERROR))
            return false
        }
        if ((!Number(innerFee) && Number(innerFee) !== 0) || Number(innerFee) < 0) {
            this.showErrorMessage(this.$t(Message.FEE_LESS_THAN_0_ERROR))
            return false
        }

        //reservedRootNamespaceNames
        const subflag = networkConfig.reservedRootNamespaceNames.every((item) => {
            if (item == subNamespaceName) {
                this.showErrorMessage(this.$t(Message.NAMESPACE_USE_BANDED_WORD_ERROR))
                return false
            }
            return true
        })
        return subflag
    }

    createSubNamespace() {
        let {rootNamespaceName, subNamespaceName, innerFee} = this.form
        const {xemDivisibility} = this
        innerFee = getAbsoluteMosaicAmount(innerFee, xemDivisibility)
        const {networkType} = this.wallet
        return new NamespaceApiRxjs().createdSubNamespace(
            subNamespaceName,
            rootNamespaceName,
            networkType,
            innerFee
        )
    }

    initForm() {
        this.form = {
            rootNamespaceName: '',
            subNamespaceName: '',
            multisigPublickey: '',
            innerFee: .5,
            aggregateFee: .5,
            lockFee: 10,
        }
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = false
    }

    createTransaction() {
        if (!this.isCompleteForm) return
        if (!this.checkForm()) return
        const {rootNamespaceName, innerFee, subNamespaceName} = this.form
        this.transactionDetail = {
            "namespace": rootNamespaceName,
            "innerFee": innerFee,
            "sub_namespace": subNamespaceName,
            "fee": innerFee
        }
        if (this.typeList[0].isSelected) {
            this.createBySelf()
        } else {
            this.createByMultisig()
        }
        this.showCheckPWDialog = true
    }

    createBySelf() {
        let transaction = this.createSubNamespace()
        this.transactionList = [transaction]
    }

    @Watch('form.multisigPublickey')
    onMultisigPublickeyChange(newPublicKey, oldPublicKey) {
        if (!newPublicKey || newPublicKey === oldPublicKey) return
        this.$store.commit('SET_ACTIVE_MULTISIG_ACCOUNT', newPublicKey)
    }

    @Watch('form', {immediate: true, deep: true})
    onFormItemChange() {
        const {rootNamespaceName, innerFee, subNamespaceName, multisigPublickey} = this.form

        // isCompleteForm
        if (this.typeList[0].isSelected) {
            this.isCompleteForm = innerFee + '' !== '' && rootNamespaceName !== '' && subNamespaceName !== ''
            return
        }
        this.isCompleteForm = innerFee + '' !== '' && rootNamespaceName !== '' && subNamespaceName !== '' && multisigPublickey && multisigPublickey.length === 64
        this.isCompleteForm = true
    }
}
