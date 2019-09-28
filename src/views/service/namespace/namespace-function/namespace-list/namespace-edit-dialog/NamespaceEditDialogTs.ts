import './NamespaceEditDialog.less'
import {mapState} from "vuex"
import {Component, Vue, Prop, Watch} from 'vue-property-decorator'
import {Password} from 'nem2-sdk'
import {Message} from "@/config/index.ts"
import {getAbsoluteMosaicAmount,formatSeconds} from '@/core/utils'
import {formDataConfig} from "@/config/view/form";
import {AppWallet} from "@/core/model"
import {createRootNamespace} from "@/core/services/namespace"
import {defaultNetworkConfig} from '@/config'

@Component({
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class NamespaceEditDialogTs extends Vue {
    activeAccount: any
    show = false
    isCompleteForm = false
    stepIndex = 0
    durationIntoDate: string = '0'
    formItems = formDataConfig.namesapceEditForm

    @Prop({default: false})
    showNamespaceEditDialog: boolean

    @Prop({
        default: {
            name: '',
            duration: ''
        }
    })
    currentNamespace: any

    get wallet() {
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

    get defaultFees() {
        return defaultNetworkConfig.defaultFees
    }

    get feeAmount() {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    namespaceEditDialogCancel() {
        this.initForm()
        this.$emit('closeNamespaceEditDialog')
    }

    submit() {
        if (!this.isCompleteForm) return
        if (!this.checkInfo()) return
        this.updateMosaic()
    }

    changeXEMRentFee() {
        const duration = Number(this.formItems.duration)
        if (Number.isNaN(duration)) {
            this.formItems.duration = 0
            this.durationIntoDate = '0'
            return
        }
        if (duration * 12 >= 60 * 60 * 24 * 365) {
            this.$Message.error(Message.DURATION_MORE_THAN_1_YEARS_ERROR)
            this.formItems.duration = 0
        }
        this.durationIntoDate = formatSeconds(duration * 12) + ''
    }

    checkInfo() {
        const {formItems} = this
        if (formItems.password === '' || formItems.duration === 0) {
            this.$Notice.error({
                title: '' + this.$t(Message.INPUT_EMPTY_ERROR)
            })
            return false
        }
        if (formItems.password.length < 8) {
            this.$Notice.error({
                title: '' + this.$t('password_error')
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
        const {duration} = this.formItems
        const {node, generationHash, feeAmount} = this
        const password = new Password(this.formItems.password)
        const transaction = createRootNamespace(
            this.currentNamespace.name,
            duration,
            this.wallet.networkType,
            feeAmount
        )
        new AppWallet(this.wallet)
            .signAndAnnounceNormal(password, node, generationHash, [transaction], this)
        this.initForm()
        this.updatedNamespace()
    }

    updatedNamespace() {
        this.show = false
        this.namespaceEditDialogCancel()
    }

    initForm() {
        this.formItems = formDataConfig.namesapceEditForm
        this.durationIntoDate = '0'
    }

    @Watch('showNamespaceEditDialog')
    onShowNamespaceEditDialogChange() {
        this.show = this.showNamespaceEditDialog
    }

    @Watch('formItems', {immediate: true, deep: true})
    onFormItemChange() {
        const {name, duration, password} = this.formItems
        // isCompleteForm
        this.isCompleteForm = name !== '' && duration > 0 && password !== ''
    }
}
