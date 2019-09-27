import {Message} from "@/config/index.ts"
import {mapState} from 'vuex'
import {Password} from "nem2-sdk"
import {Component, Vue} from 'vue-property-decorator'
import {formDataConfig} from "@/config/view/form";
import {networkTypeConfig} from '@/config/view/setting';
import {AppLock} from "@/core/utils";
import {AppInfo, StoreAccount, AppWallet} from "@/core/model"

@Component({
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app'
        })
    }
})
export class AccountImportMnemonicTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    form = formDataConfig.walletImportMnemonicForm
    NetworkTypeList = networkTypeConfig
    account = {}
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

    submit() {
        if (!this.checkImport()) return
        this.showCheckPWDialog = true

    }

    checkEnd(password) {
        if (!password) return
        const {mnemonic} = this.form
        const seed = AppLock.encryptString(mnemonic, password)
        this.$store.commit('SET_MNEMONIC', seed)
        this.importWallet(password)
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = true
    }

    checkImport() {
        if (this.form.networkType == 0) {
            this.$Notice.error({
                title: this.$t(Message.PLEASE_SWITCH_NETWORK) + ''
            })
            return false
        }
        if (!this.form.walletName || this.form.walletName == '') {
            this.$Notice.error({
                title: this.$t(Message.WALLET_NAME_INPUT_ERROR) + ''
            })
            return false
        }
        // if (!this.form.password || this.form.password.length < 8) {
        //     this.$Notice.error({
        //         title: this.$t(Message.PASSWORD_SETTING_INPUT_ERROR) + ''
        //     })
        //     return false
        // }
        // if (this.form.password !== this.form.checkPW) {
        //     this.$Notice.error({
        //         title: this.$t(Message.INCONSISTENT_PASSWORD_ERROR) + ''
        //     })
        //     return false
        // }
        if (!this.form.mnemonic || this.form.mnemonic === '' || this.form.mnemonic.split(' ').length != 12) {
            this.$Notice.error({
                title: this.$t(Message.MNENOMIC_INPUT_ERROR) + ''
            })
            return false
        }
        return true
    }

    importWallet(password) {
        const {walletName, mnemonic, networkType} = this.form
        try {
            new AppWallet().createFromMnemonic(
                walletName,
                new Password(password),
                mnemonic,
                networkType,
                this.$store
            )
            this.toWalletDetails()
        } catch (error) {
            console.error(error)
            this.$Notice.error({
                title: this.$t(Message.OPERATION_FAILED_ERROR) + ''
            })
        }
    }

    toWalletDetails() {
        this.$Notice.success({
            title: this['$t']('Imported_wallet_successfully') + ''
        })
        this.$store.commit('SET_HAS_WALLET', true)
        this.$router.push('dashBoard')
    }

    toBack() {
        this.$router.push('initAccount')
    }
}
