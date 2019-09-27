import {mapState} from 'vuex'
import {Component, Vue} from 'vue-property-decorator'
import TheWalletDelete from '@/views/wallet/wallet-switch/the-wallet-delete/TheWalletDelete.vue'
import {formatXEMamount, formatNumber, localRead} from '@/core/utils/utils.ts'
import {AppWallet, AppInfo, StoreAccount} from "@/core/model"
import {CreateWalletType} from "@/core/model/CreateWalletType"
import {walletStyleSheetType} from '@/config/view/wallet.ts'
import {MultisigAccountInfo} from 'nem2-sdk'
import TheWalletUpdate from "@/views/wallet/wallet-switch/the-wallet-update/TheWalletUpdate.vue"

@Component({
    components: {TheWalletDelete, TheWalletUpdate},
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app',
        })
    }
})
export class WalletSwitchTs extends Vue {
    app: AppInfo
    activeAccount: StoreAccount
    showCheckPWDialog = false
    deleteIndex = -1
    deletecurrent = -1
    walletToDelete: AppWallet | boolean = false
    thirdTimestamp = 0
    walletStyleSheetType = walletStyleSheetType
    showUpdateDialog = false
    walletToUpdate = {}


    get walletList() {
        let {walletList} = this.app
        walletList.sort((a, b) => {
            return b.createTimestamp - a.createTimestamp
        })
        return walletList.map(item => {
            const walletType = item.accountTitle.substring(0, item.accountTitle.indexOf('-'))
            switch (walletType) {
                case CreateWalletType.keyStore:
                case CreateWalletType.privateKey:
                    item.stylesheet = walletStyleSheetType.otherWallet
                    break
                case CreateWalletType.seed:
                    item.stylesheet = walletStyleSheetType.seedWallet
                    break
            }
            return item
        })
    }

    get wallet() {
        return this.activeAccount.wallet
    }


    get currentXEM1() {
        return this.activeAccount.currentXEM1
    }

    isMultisig(address: string): boolean {
        const multisigAccountInfo: MultisigAccountInfo = this.activeAccount.multisigAccountInfo[address]
        if (!multisigAccountInfo) return false
        return multisigAccountInfo.cosignatories.length > 0
    }

    closeUpdateDialog() {
        this.showUpdateDialog = false
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = false
    }

    switchWallet(newActiveWalletAddress) {
        AppWallet.switchWallet(newActiveWalletAddress, this.walletList, this.$store)
    }

    formatNumber(number) {
        return formatNumber(number)
    }

    formatXEMamount(text) {
        return formatXEMamount(text)
    }
    
    toImport() {
        this.$emit('toImport')
    }

    toCreate() {
        this.$emit('toCreate')
    }
}
