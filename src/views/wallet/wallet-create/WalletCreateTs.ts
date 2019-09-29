import {Message} from "@/config/index.ts"
import {Component, Vue} from 'vue-property-decorator'
import {NetworkType, Password} from "nem2-sdk"
import CheckPasswordDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {AppAccounts, AppWallet, StoreAccount} from '@/core/model'
import {mapState} from "vuex"
import {createSubWalletByPath} from "@/core/utils/hdWallet.ts"
import {networkConfig} from '@/config/index.ts'
import {networkTypeConfig} from '@/config/view/setting'

@Component({
    components: {
        CheckPasswordDialog
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class WalletCreateTs extends Vue {
    activeAccount: StoreAccount
    formItem = {
        currentNetType: NetworkType.MIJIN_TEST,
        walletName: 'wallet-create',
        path: `m/44'/43'/1'/0/0`
    }
    networkTypeList = networkTypeConfig

    showCheckPWDialog = false


    get accountName() {
        return this.activeAccount.accountName
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = false
    }

    checkEnd(password) {
        if (!password) return
        const {accountName} = this
        const {currentNetType, walletName, path} = this.formItem
        const appAccounts = AppAccounts()
        try {
            new AppWallet().createFromPath(walletName, new Password(password), path, currentNetType, this.$store)
            this.$router.push('dashBoard')
        } catch (e) {
            this.$Notice.error({title: this.$t(Message.HD_WALLET_PATH_ERROR) + ''})
        }
    }

    submit() {
        if (!this.checkInput()) return
        this.showCheckPWDialog = true
    }

    checkInput() {
        const {currentNetType, walletName, path} = this.formItem
        if (!currentNetType) {
            this.$Notice.error({title: this.$t(Message.PLEASE_SWITCH_NETWORK) + ''})
            return false
        }
        if (!walletName || walletName == '') {
            this.$Notice.error({title: this.$t(Message.WALLET_NAME_INPUT_ERROR) + ''})
            return false
        }
        if (!path) {
            this.$Notice.error({title: this.$t(Message.PASSWORD_SETTING_INPUT_ERROR) + ''})
            return false
        }
        try {
            createSubWalletByPath(networkConfig.testMnemonicString, path)
            return true
        } catch (e) {
            this.$Notice.error({title: this.$t(Message.HD_WALLET_PATH_ERROR) + ''})
            return false
        }

    }

    toBack() {
        this.$emit('closeCreate')
    }
}
