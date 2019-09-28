import {Mosaic, MosaicId, UInt64, Address, NamespaceId, AliasType, MultisigAccountInfo, PublicAccount} from 'nem2-sdk'
import {mapState} from "vuex"
import {Message, DEFAULT_FEES, FEE_GROUPS, formDataConfig, defaultNetworkConfig} from "@/config"
import {Component, Provide, Vue, Watch} from 'vue-property-decorator'
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {getAbsoluteMosaicAmount, getRelativeMosaicAmount} from "@/core/utils"
import {TransactionApiRxjs} from "@/core/api/TransactionApiRxjs"
import {MessageType} from "nem2-sdk/dist/src/model/transaction/MessageType"
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs"
import {standardFields} from "@/core/validation"
import ErrorTooltip from '@/views/other/forms/errorTooltip/ErrorTooltip.vue'
import {createBondedMultisigTransaction, createCompleteMultisigTransaction, AppMosaic, AppWallet, AppInfo, StoreAccount, DefaultFee} from "@/core/model"

@Component({
    components: {
        CheckPWDialog,
        ErrorTooltip
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app'
        })
    },
})
export class TransactionFormTs extends Vue {
    @Provide() validator: any = this.$validator
    activeAccount: StoreAccount
    app: AppInfo
    isShowPanel = true
    transactionList = []
    transactionDetail = {}
    isShowSubAlias = false
    showCheckPWDialog = false
    otherDetails: any = {}
    isCompleteForm = true
    currentCosignatoryList = []
    currentMosaic: string = ''
    currentAmount: number = 0
    isAddressMapNull = true
    formItems = formDataConfig.transferForm
    standardFields: object = standardFields
    getRelativeMosaicAmount = getRelativeMosaicAmount
    XEM: string = defaultNetworkConfig.XEM
  
    get addressAliasMap() {
        const addressAliasMap = this.activeAccount.addressAliasMap
        for (let item in addressAliasMap) {
            this.isAddressMapNull = false
            return addressAliasMap
        }
        this.isAddressMapNull = true
        return addressAliasMap
    }

    get defaultFees(): DefaultFee[] {
        return this.isSelectedAccountMultisig ? DEFAULT_FEES[FEE_GROUPS.SINGLE] : DEFAULT_FEES[FEE_GROUPS.DOUBLE]
    }

    get feeAmount() {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    get isSelectedAccountMultisig(): boolean {
        return this.activeAccount.activeMultisigAccount ? true : false
    }

    get activeMultisigAccount(): string {
        return this.activeAccount.activeMultisigAccount
    }

    get activeMultisigAccountAddress(): string {
      const {activeMultisigAccount} = this
      return activeMultisigAccount
          ? Address.createFromPublicKey(activeMultisigAccount, this.getWallet.networkType).plain()
          : null
    }

    get multisigMosaicList(): Record<string, AppMosaic> {
        const {activeMultisigAccountAddress} = this
        const {multisigAccountsMosaics} = this.activeAccount
        if (!activeMultisigAccountAddress) return {}
        return multisigAccountsMosaics[activeMultisigAccountAddress] || {}
    }

    get currentMinApproval(): number {
        const {activeMultisigAccountAddress} = this
        if (!activeMultisigAccountAddress) return 0
        const {multisigAccountInfo} = this.activeAccount
        return multisigAccountInfo[activeMultisigAccountAddress]
            ? multisigAccountInfo[activeMultisigAccountAddress].minApproval : 0
    }

    get multisigAccountInfo(): MultisigAccountInfo {
        return this.activeAccount.multisigAccountInfo[this.getWallet.address]
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

    get generationHash() {
        return this.activeAccount.generationHash
    }

    get accountAddress() {
        return this.activeAccount.wallet.address
    }

    get accountPublicKey(): string {
        return this.activeAccount.wallet.publicKey
    }

    get currentXEM1() {
        return this.activeAccount.currentXEM1
    }

    get getWallet(): AppWallet {
        return this.activeAccount.wallet
    }

    get node() {
        return this.activeAccount.node
    }

    get networkType() {
        return this.activeAccount.wallet.networkType
    }

    get mosaicsLoading() {
        return this.app.mosaicsLoading
    }

    get mosaics() {
        const {mosaicsLoading} = this
        return mosaicsLoading ? [] : this.activeAccount.mosaics
    }

    get currentHeight() {
        return this.app.chainStatus.currentHeight
    }

    get xemDivisibility() {
        return this.activeAccount.xemDivisibility
    }

    get mosaicList() {
        // @TODO: would be better to return a loading indicator
        // instead of an empty array ([] = "no matching data" in the select dropdown)
        const {mosaics, currentHeight, multisigMosaicList, isSelectedAccountMultisig} = this
        const mosaicMap = isSelectedAccountMultisig ? multisigMosaicList : mosaics
        const mosaicList: any = Object.values(mosaicMap)
        // @TODO: refactor, make it an AppMosaic method
        return [...mosaicList]
            .filter(mosaic => mosaic.balance && mosaic.balance > 0
                && (mosaic.expirationHeight === 'Forever'
                    || currentHeight < mosaic.expirationHeight))
            .map(({name, balance, hex}) => ({
                label: `${name || hex} (${balance.toLocaleString()})`,
                value: hex,
            }))
    }

    initForm() {
        this.formItems = formDataConfig.transferForm
        this.formItems.multisigPublickey = this.accountPublicKey
        this.resetFields()
    }

    addMosaic() {
        const {currentMosaic, mosaics, currentAmount} = this
        const {divisibility} = mosaics[currentMosaic].properties
        const mosaicTransferList = [...this.formItems.mosaicTransferList]
        const that = this
        let resultAmount = currentAmount
        mosaicTransferList.every((item, index) => {
                if (item.id.toHex() == currentMosaic) {
                    resultAmount = Number(getRelativeMosaicAmount(item.amount.compact(), divisibility)) + Number(resultAmount)
                    that.formItems.mosaicTransferList.splice(index, 1)
                    return false
                }
                return true
            }
        )
        this.formItems.mosaicTransferList.unshift(
            new Mosaic(
                new MosaicId(currentMosaic),
                UInt64.fromUint(
                    getAbsoluteMosaicAmount(resultAmount, divisibility)
                )
            )
        )
    }

    removeMosaic(index) {
        this.formItems.mosaicTransferList.splice(index, 1)
    }

    async submit() {
        // get alias
        let {address} = this.formItems
        await this.getAddressByAlias()
        const that = this
        if (!address || address.length < 40) {
            this.$Notice.error({
                title: that.$t(Message.ADDRESS_ALIAS_NOT_EXIST_ERROR) + ''
            })
            return
        }
        if (!this.checkForm()) return

        this.$validator
            .validate()
            .then((valid) => {
                if (!valid) return
                this.showDialog()
            })
    }

    showDialog() {
        const {accountPublicKey, isSelectedAccountMultisig, feeAmount} = this
        const {address, remark, mosaicTransferList, isEncrypted} = this.formItems
        const publicKey = isSelectedAccountMultisig ? accountPublicKey : '(self)' + accountPublicKey
        const lockFee = feeAmount / 3

        this.transactionDetail = {
            "transaction_type": isSelectedAccountMultisig ? 'Multisig_transfer' : 'ordinary_transfer',
            "Public_account": publicKey,
            "transfer_target": address,
            "mosaic": mosaicTransferList.map(item => {
                return item.id.id.toHex() + `(${item.amount.compact()})`
            }).join(','),
            "fee": feeAmount + 'XEM',
            "remarks": remark,
            "encryption": isEncrypted,
        }
        this.otherDetails = isSelectedAccountMultisig ? {
            lockFee: lockFee
        } : {}

        if (isSelectedAccountMultisig) {
            this.sendMultisigTransaction()
            this.showCheckPWDialog = true
            return
        }
        this.sendTransaction()
        this.showCheckPWDialog = true
    }

    sendTransaction() {
        let {address, remark, mosaicTransferList, isEncrypted, } = this.formItems
        const {feeAmount, networkType} = this
        const innerFee = feeAmount

        const transaction = new TransactionApiRxjs().transferTransaction(
            networkType,
            innerFee,
            address,
            mosaicTransferList,
            isEncrypted ? MessageType.EncryptedMessage : MessageType.PlainMessage,
            remark
        )
        this.transactionList = [transaction]
    }

    sendMultisigTransaction() {
        if (this.currentMinApproval == 0) {
            return
        }
        const {networkType, feeAmount} = this
        let {address, mosaicTransferList, isEncrypted, remark, multisigPublickey} = this.formItems
        const innerFee = feeAmount/3
        const aggregateFee = feeAmount/3

        const transaction = new TransactionApiRxjs().transferTransaction(
            networkType,
            innerFee,
            address,
            mosaicTransferList,
            isEncrypted ? MessageType.EncryptedMessage : MessageType.PlainMessage,
            remark
        )

        if (this.currentMinApproval > 1) {
            const aggregateTransaction = createBondedMultisigTransaction(
                [transaction],
                multisigPublickey,
                networkType,
                innerFee
            )
            this.transactionList = [aggregateTransaction]
            return
        }
        const aggregateTransaction = createCompleteMultisigTransaction(
            [transaction],
            multisigPublickey,
            networkType,
            aggregateFee
        )
        this.transactionList = [aggregateTransaction]
    }

    async checkForm() {
        const {address, mosaicTransferList, multisigPublickey} = this.formItems

        // multisig check
        if (multisigPublickey.length < 64) {
            this.showErrorMessage(this.$t(Message.ILLEGAL_PUBLICKEY_ERROR))
            return false
        }
        if (address.length < 40) {
            this.showErrorMessage(this.$t(Message.ADDRESS_FORMAT_ERROR))
            return false
        }
        if (mosaicTransferList.length < 1) {
            this.showErrorMessage(this.$t(Message.MOSAIC_LIST_NULL_ERROR))
            return false
        }
        return true
    }

    showErrorMessage(message) {
        this.$Notice.destroy()
        this.$Notice.error({
            title: message
        })
    }

    async getAddressByAlias() {
        const {node} = this
        let addressAlias = this.formItems.address
        if (addressAlias.indexOf('@') == -1) {
            return
        }
        const namespaceId = new NamespaceId(addressAlias.substring(1))
        try {
            const namespaceInfo: any = await new NamespaceApiRxjs().getNamespace(namespaceId, node).toPromise()
            if (namespaceInfo.alias.type === AliasType.Address) {
                //@ts-ignore
                this.formItems.address = Address.createFromEncoded(namespaceInfo.alias.address).address
            }
        } catch (e) {
            console.error(e)
        }
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
        this.initForm()
    }


    @Watch('formItems.multisigPublickey')
    onMultisigPublickeyChange(newPublicKey, oldPublicKey) {
        if (!newPublicKey || newPublicKey === oldPublicKey) return
        this.$store.commit('SET_ACTIVE_MULTISIG_ACCOUNT', newPublicKey)
    }

    @Watch('getWallet', {deep: true})
    onWalletChange(newVal, oldVal) {
        if (!newVal.publicKey) return
        const multisigPublickey = newVal.publicKey
        if (multisigPublickey !== oldVal.publicKey) {
            this.initForm()
        }
    }

    resetFields() {
        this.$nextTick(() => this.$validator.reset())
    }

    // @TODO: set this function at a higher level and put the multisig wallet list in the store
    async mounted() {
        this.initForm()
    }
}
