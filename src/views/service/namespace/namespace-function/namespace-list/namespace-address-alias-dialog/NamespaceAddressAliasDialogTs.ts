import {mapState} from "vuex"
import {Address, AddressAlias, AliasActionType, NamespaceId, Password} from "nem2-sdk"
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {Message, defaultNetworkConfig, DEFAULT_FEES, FEE_GROUPS, formDataConfig} from "@/config"
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs.ts"
import {Address, AddressAlias, AliasAction, NamespaceId, Password} from "nem2-sdk"
import {AppWallet} from "@/core/utils/wallet.ts"
import {formatAddress, formatSeconds} from "@/core/utils/utils.ts"
import {mapState} from "vuex"

@Component({
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app'
        })
    }
})
export class NamespaceAddressAliasDialogTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    isCompleteForm = true
    aliasListIndex = -1
    formItems = formDataConfig.addressAliasForm
    XEM: string = defaultNetworkConfig.XEM

    @Prop()
    isShowAddressAliasDialog: boolean

    @Prop()
    activeNamespace: AppNamespace

    get show() {
        return this.isShowAddressAliasDialog
    }
  
    set show(val) {
        if (!val) {
            this.$emit('close')
        }
    }

    get wallet(): AppWallet {
        return this.activeAccount.wallet
    }

    get NamespaceList() {
        return this.activeAccount.namespaces
    }

    get generationHash() {
        return this.activeAccount.generationHash
    }

    get node() {
        return this.activeAccount.node
    }

    get nowBlockHeight() {
        return this.app.chainStatus.currentHeight
    }

    get aliasList() {
        return this.NamespaceList.filter(namespace => namespace.alias instanceof AddressAlias)
    }

    get xemDivisibility() {
        return this.activeAccount.xemDivisibility
    }

    get defaultFees(): DefaultFee[] {
        return DEFAULT_FEES[FEE_GROUPS.SINGLE]
    }

    get feeAmount() {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    closeModel() {
        this.$emit('closeAddressAliasDialog')
        this.aliasListIndex = -1
        this.formItems = formDataConfig.addressAliasForm
        this.show = false
    }

    checkForm(): boolean {
        const {password, address} = this.formItems

        if (address.length < 40) {
            this.showErrorMessage(this.$t(Message.ADDRESS_FORMAT_ERROR))
            return false
        }
        if (!(password || password.trim())) {
            this.showErrorMessage(this.$t(Message.INPUT_EMPTY_ERROR) + '')
            return false
        }
        if (password.length < 8) {
            this.showErrorMessage(this.$t('password_error') + '')
            return false
        }

        const validPassword = new AppWallet(this.wallet).checkPassword(new Password(password))

        if (!validPassword) {
            this.showErrorMessage(this.$t('password_error') + '')
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

    submit() {
        if (!this.isCompleteForm) return
        if (!this.checkForm()) return
        if (this.aliasListIndex >= 0) {
            this.addressAlias(false)
        } else {
            this.addressAlias(true)
        }
    }

    addressAlias(type) {
        let transaction = new NamespaceApiRxjs().addressAliasTransaction(
            type ? AliasAction.Link : AliasAction.Unlink,
            new NamespaceId(this.formItem.alias),
            Address.createFromRawAddress(this.formItem.address),
            this.getWallet.networkType,
            this.formItem.fee
        )
        const {node, generationHash} = this
        const password = new Password(this.formItems.password)

        new AppWallet(this.wallet).signAndAnnounceNormal(password, node, generationHash, [transaction], this)
        this.closeModel()
    }

    computeDuration(duration) {
        let expireTime = duration - this.nowBlockHeight > 0 ? this.durationToTime(duration - this.nowBlockHeight) : 'Expired'
        return expireTime
    }

    durationToTime(duration) {
        const durationNum = Number(duration)
        return formatSeconds(durationNum * 12)
    }
}
