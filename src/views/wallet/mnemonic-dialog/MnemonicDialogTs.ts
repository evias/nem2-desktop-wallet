import {AppWallet} from "@/core/utils/wallet.ts"
import {Component, Vue, Prop, Watch} from 'vue-property-decorator'
import {mapState} from "vuex"
import {Password} from "nem2-sdk"
import {AppLock} from '@/core/utils/appLock'
import {randomMnemonicWord} from "@/core/utils/hdWallet.ts"

@Component({
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class MnemonicDialogTs extends Vue {
    activeAccount: any
    show = false
    stepIndex = 0
    mnemonic = ''
    mnemonicRandomArr = []
    wallet = {
        password: '',
        mnemonicWords: ''
    }
    @Prop()
    showMnemonicDialog: boolean

    get getWallet() {
        return this.activeAccount.wallet
    }

    get path() {
        return this.getWallet.path
    }

    mnemonicDialogCancel() {
        this.wallet = {
            password: '',
            mnemonicWords: ''
        }
        this.$emit('closeMnemonicDialog')
        setTimeout(() => {
            this.stepIndex = 0
        }, 300)
    }

    exportMnemonic() {
        switch (this.stepIndex) {
            case 0 :
                this.checkPassword()
                break
            case 1 :
                this.stepIndex = 2
                break
            case 2 :
                this.stepIndex = 3
                break
            case 3 :
                if (!this.checkMnemonic()) return
                this.stepIndex = 4
                break
            case 4 :
                this.mnemonicDialogCancel()
                break
        }
    }

    checkPassword() {
        if (!this.checkInput()) return
        this.mnemonic = AppLock.decryptString(this.getWallet.encryptedMnemonic, this.wallet.password)
        this.mnemonicRandomArr = randomMnemonicWord(this.mnemonic.split(' '))
        this.stepIndex = 1
    }

    checkInput() {
        if (!this.wallet.password || this.wallet.password == '') {
            this.$Notice.error({
                title: this.$t('please_set_your_wallet_password') + ''
            })
            return false
        }

        if (this.wallet.password.length < 8) {
            this.$Notice.error({
                title: this.$t('password_error') + ''
            })
            return false
        }

        const validPassword = new AppWallet(this.getWallet).checkPassword(new Password(this.wallet.password))

        if (!validPassword) {
            this.$Notice.error({
                title: this.$t('password_error') + ''
            })
            return false
        }

        return true
    }

    toPrePage() {
        this.stepIndex = this.stepIndex - 1
    }

    sureWord(index) {
        const word = this.mnemonicRandomArr[index]
        const wordSpan = document.createElement('span')
        wordSpan.innerText = word
        wordSpan.onclick = () => {
            this.$refs['mnemonicWordDiv']['removeChild'](wordSpan)
        }
        const inputArray = this
            .$refs['mnemonicWordDiv']['innerText']
            .replace(' ', '')
            .split("\n")
        
        const wordInInputArray = inputArray.find(x => x === word)
        if (wordInInputArray === undefined) this.$refs['mnemonicWordDiv']['append'](wordSpan)
    }

    checkMnemonic() {
        const mnemonicDiv = this.$refs['mnemonicWordDiv']
        const mnemonicDivChild = mnemonicDiv['getElementsByTagName']('span')
        let childWord = []
        for (let i in mnemonicDivChild) {
            if (typeof mnemonicDivChild[i] !== "object") continue
            childWord.push(mnemonicDivChild[i]['innerText'])
        }
        if (JSON.stringify(childWord) != JSON.stringify(this.mnemonic.split(' '))) {
            if (childWord.length < 1) {
                this.$Notice.warning({
                    title: this['$t']('Please_enter_a_mnemonic_to_ensure_that_the_mnemonic_is_correct') + ''
                })
                return false
            }
            this.$Notice.warning({
                title: this['$t']('Mnemonic_inconsistency') + ''
            })
            return false
        }
        return true
    }

    // @TODO: use v-model
    @Watch('showMnemonicDialog')
    onShowMnemonicDialogChange() {
        this.show = this.showMnemonicDialog
    }
}
