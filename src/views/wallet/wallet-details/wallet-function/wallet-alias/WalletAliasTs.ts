import {Message} from "@/config/index.ts"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {EmptyAlias} from "nem2-sdk/dist/src/model/namespace/EmptyAlias"
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs.ts"
import {Address, AddressAlias, AliasAction, NamespaceId, Password} from "nem2-sdk"
import {AppWallet} from "@/core/utils/wallet.ts"
import {formatAddress, formatSeconds} from "@/core/utils/utils.ts"
import {mapState} from "vuex"
import {StoreAccount, AppInfo, removeLink, saveLocalAlias, readLocalAlias} from "@/core/model"
import {networkConfig} from "@/config/index"

@Component({
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app'
        })
    }
})
export class WalletAliasTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    pageSize = 5
    isShowDialog = false
    isShowDeleteIcon = false
    showCheckPWDialog = false
    isCompleteForm = true
    aliasListIndex = -1
    aliasActionTypeList = []
    aliasList = []
    currentPage = 1
    formItem = {
        address: '',
        alias: '',
        tag: ''
    }

    get getWallet() {
        return this.activeAccount.wallet
    }

    get xemDivisibility() {
        return this.activeAccount.xemDivisibility
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

    get currentHeight() {
        return this.app.chainStatus.currentHeight
    }


    showUnLink(index) {
        this.aliasListIndex = index
        this.formItem = {
            address: this.aliasList[index].alias.address,
            alias: '',
            tag: ''
        }
        this.isShowDialog = true
    }

    handleChange(page) {
        this.currentPage = page
    }

    closeModel() {
        this.isShowDialog = false
        this.aliasListIndex = -1
        this.formItem = {
            address: '',
            alias: '',
            tag: ''
        }
    }

    checkForm(): boolean {
        const {address, alias} = this.formItem
        if (address.length < 40) {
            this.showErrorMessage(this.$t(Message.ADDRESS_FORMAT_ERROR))
            return false
        }
        if (!(alias || alias.trim())) {
            this.showErrorMessage(this.$t(Message.INPUT_EMPTY_ERROR) + '')
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
    removeLink(aliasObject){
        removeLink(aliasObject, this.getWallet.address)
        this.initLocalAlias()
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
        const password = new Password(this.formItem.password)

        new AppWallet(this.getWallet).signAndAnnounceNormal(password, node, generationHash, [transaction], this)
        this.closeModel()
        this.initLocalAlias()
    }

    formatAddress(address) {
        return formatAddress(address)
    }

    computeDuration(endHeight) {
        let expireTime = endHeight > this.currentHeight ? this.durationToTime(endHeight - this.currentHeight - networkConfig.namespaceGracePeriodDuration) : 'Expired'
        return expireTime
    }

    durationToTime(duration) {
        const durationNum = Number(duration)
        return formatSeconds(durationNum * 12)
    }

    initLocalAlias() {
        this.currentPage = 1
        const addressBook = readLocalAlias(this.getWallet.address)
        this.aliasList = addressBook && addressBook.aliasMap ? Object.values(addressBook.aliasMap) : []
    }

    @Watch('getWallet.address')
    onAddressChange() {
        this.initLocalAlias()
    }


    mounted() {
        this.initLocalAlias()
    }

}
