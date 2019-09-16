import {Message} from "@/config"
import {Component, Vue} from 'vue-property-decorator'
import {NetworkType} from "nem2-sdk"

import Nem from "./hw-app-nem.js"
// import { NemLedger } from "@/core/api/LedgerApi"
import TransportWebUSB from "@ledgerhq/hw-transport-webusb"
// import {encryptKey, getAccountByLedger, saveLocalWallet} from "@/core/utils/wallet"

@Component
export class WalletImportLedgerTs extends Vue {
    account = {}
    form = {
        networkType: 0,
        walletName: '',
    }
    NetworkTypeList = [
        {
            value: NetworkType.MIJIN_TEST,
            label: 'MIJIN_TEST'
        }, {
            value: NetworkType.MAIN_NET,
            label: 'MAIN_NET'
        }, {
            value: NetworkType.TEST_NET,
            label: 'TEST_NET'
        }, {
            value: NetworkType.MIJIN,
            label: 'MIJIN'
        },
    ]

    get getNode () {
        return this.$store.state.account.node
    }

    get currentXEM1(){
        return this.$store.state.account.currentXEM1
    }

    get currentXEM2(){
        return this.$store.state.account.currentXEM2
    }

    async importWallet() {
        if (!this.checkImport()) return
        // this.loginWallet(this.account)
        const transport = await TransportWebUSB.create();
        const nemH = new Nem(transport);

        const account = await nemH.getAddress("44'/43'/144'/0'/0'");
        transport.close();
        
        this.loginWallet(account);
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
        return true
    }

    loginWallet(account) {
        const that = this
        const walletName: any = this.form.walletName;
        const netType: NetworkType = this.form.networkType;
        const walletList = this.$store.state.app.walletList
        const style = 'walletItem_bg_' + walletList.length % 3
        // getAccountByLedger(walletName, account, netType, this.getNode, this.currentXEM1, this.currentXEM2)
        //     .then((wallet)=>{
        //         let storeWallet = wallet
        //         storeWallet['style'] = style
        //         that.$store.commit('SET_WALLET', storeWallet)
        //         const encryptObj = encryptKey('privateKey', 'password')
        //         saveLocalWallet(storeWallet, encryptObj, null,{})
        //         this.toWalletDetails()
        //     })
    }

    toWalletDetails() {
        this.$Notice.success({
            title: this['$t']('Import_ledger_account_successfully') + '',
        });
        this.$store.commit('SET_HAS_WALLET', true)
        this.$emit('toWalletDetails')
    }

    toBack() {
        this.$emit('closeImport')
    }

}
