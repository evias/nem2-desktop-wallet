import {AliasActionType, MosaicId, Password, Address} from "nem2-sdk"
import {mapState} from "vuex"
import {Component, Vue, Prop, Watch} from 'vue-property-decorator'
import {Message, defaultNetworkConfig, formDataConfig, DEFAULT_FEES, FEE_GROUPS} from "@/config"
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs.ts"
import {getAbsoluteMosaicAmount} from '@/core/utils'
import {AppWallet, StoreAccount, DefaultFee} from "@/core/model"

@Component({
        computed: {...mapState({activeAccount: 'account'})},
    }
)
export class NamespaceUnAliasDialogTs extends Vue {
    activeAccount: StoreAccount
    show = false
    isCompleteForm = false
    aliasNameList: any[] = []
    formItems = formDataConfig.mosaicUnaliasForm
    XEM: string = defaultNetworkConfig.XEM

    @Prop()
    showUnAliasDialog: boolean

    @Prop()
    unAliasItem: any

    get wallet(): AppWallet {
        return this.activeAccount.wallet
    }

    get generationHash() {
        return this.activeAccount.generationHash
    }

    get node() {
        return this.activeAccount.node
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

    initForm() {
        this.formItems = formDataConfig.mosaicUnaliasForm
    }

    mosaicAliasDialogCancel() {
        this.initForm()
        this.show = false
    }

    submit() {
        if (!this.isCompleteForm) return
        if (!this.checkInfo()) return
        this.updateMosaic()
    }

    checkInfo() {
        const {formItems} = this

        if (formItems.password === '') {
            this.$Notice.error({
                title: '' + this.$t(Message.INPUT_EMPTY_ERROR)
            })
            return false
        }

        if (formItems.password.length < 8) {
            this.$Notice.error({
                title: '' + this.$t(Message.INPUT_EMPTY_ERROR)
            })
            return false
        }

        const validPassword = new AppWallet(this.wallet).checkPassword(new Password(formItems.password))

        if (!validPassword) {
            this.$Notice.error({
                title: '' + this.$t('password_error')
            })
            return false
        }
        return true
    }

    async updateMosaic() {
        const {node, generationHash, xemDivisibility, feeAmount} = this
        const {networkType} = this.wallet
        const password = new Password(this.formItems.password)
        let {hex, id, aliasTarget} = this.unAliasItem

        const transaction = aliasTarget.length >= 40 // quickfix
            ? new NamespaceApiRxjs().addressAliasTransaction(
                AliasActionType.Unlink,
                id,
                Address.createFromRawAddress(aliasTarget),
                networkType,
                feeAmount)
            : new NamespaceApiRxjs().mosaicAliasTransaction(
                AliasActionType.Unlink,
                id,
                new MosaicId(hex),
                networkType,
                feeAmount)
        new AppWallet(this.wallet)
            .signAndAnnounceNormal(password, node, generationHash, [transaction], this)
        this.initForm()
        this.mosaicAliasDialogCancel()
    }

    @Watch('formItems', {deep: true})
    onformItemsChange() {
        const {password} = this.formItems
        this.isCompleteForm = password !== ''
    }
}
