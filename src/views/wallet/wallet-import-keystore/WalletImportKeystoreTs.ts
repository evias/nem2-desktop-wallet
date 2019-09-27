import {Message} from "@/config/index.ts"
import {Password} from "nem2-sdk"
import {mapState} from 'vuex'
import {Component, Vue} from 'vue-property-decorator'
import CheckPasswordDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {importKeystoreConfig} from '@/config/view/wallet'
import {networkTypeConfig} from '@/config/view/setting'
import {AppWallet, AppInfo, StoreAccount} from "@/core/model"

@Component({
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app'
        })
    },
    components: {
        CheckPasswordDialog
    }
})
export class WalletImportKeystoreTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    file = ''
    fileList = []
    NetworkTypeList = networkTypeConfig
    formItem = importKeystoreConfig
    showCheckPWDialog = false

    get getNode() {
        return this.activeAccount.node
    }

    get currentXEM1() {
        return this.activeAccount.currentXEM1
    }

    get walletList() {
        return this.app.walletList
    }

    checkEnd(password) {
        if (!password) return
        this.importWallet(password)
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = false
    }

    submit() {
        if (!this.checkForm()) return
        this.showCheckPWDialog = true
    }

    importWallet(password) {
        try {
            new AppWallet().createFromKeystore(
                this.formItem.walletName,
                new Password(password),
                this.formItem.keystoreStr,
                this.formItem.networkType,
                this.$store
            )
            this.toWalletDetails()
        } catch (error) {
            console.error(error)
            this.showErrorNotice(Message.OPERATION_FAILED_ERROR)
        }
    }

    toWalletDetails() {
        this.$Notice.success({
            title: this['$t']('Imported_wallet_successfully') + ''
        })
        this.$store.commit('SET_HAS_WALLET', true)
        this.$emit('toWalletDetails')
    }

    async checkForm() {
        const {keystoreStr, networkType, walletName} = this.formItem
        if (networkType == 0) {
            this.showErrorNotice(Message.PLEASE_SWITCH_NETWORK)
            return false
        }
        if (!walletName || walletName == '') {
            this.showErrorNotice(Message.WALLET_NAME_INPUT_ERROR)
            return false
        }
        return true
    }

    showErrorNotice(text) {
        this.$Notice.destroy()
        this.$Notice.error({
            title: this.$t(text) + ''
        })
    }

    toBack() {
        this.$emit('closeImport')
    }
}
