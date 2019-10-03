import {mapState} from "vuex"
import { Password } from "nem2-sdk"
import {Component, Vue, Prop} from 'vue-property-decorator'

// internal dependencies
import {Message} from "@/config/index.ts"
import {AppWallet, StoreAccount} from "@/core/model"

@Component({
    computed: {...mapState({activeAccount: 'account'})},
})
export class AccountUnlockDialogTs extends Vue {
    stepIndex = 0
    show = false
    activeAccount: StoreAccount
    formModel = {
        password: ''
    }

    @Prop({default: () => false})
    showDialog: Boolean

    closeDialog() {
        this.$emit('close')
    }

    validatePassword() {
        try {
            const account = new AppWallet(this.activeAccount.wallet).getAccount(
                new Password(this.formModel.password))

            // emit unlocked account
            this.$emit('accountUnlockResult', true)
            this.$emit('accountUnlocked', account)

            // notify success
            this.$Notice.success({
                title: this.$t(Message.SUCCESS_ACCOUNT_UNLOCK) + ''
            })

            this.closeDialog()
        }
        catch (e) {
            this.$emit('accountUnlockResult', false)
            this.$Notice.destroy()
            this.$Notice.error({
                title: this.$t(Message.WRONG_PASSWORD_ERROR) + ''
            })
        }
    }

}
