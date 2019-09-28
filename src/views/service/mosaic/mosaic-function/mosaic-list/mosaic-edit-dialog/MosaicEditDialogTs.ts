import {Component, Vue, Prop, Watch} from 'vue-property-decorator'
import {mapState} from "vuex"
import {Password, NetworkType, MosaicSupplyChangeTransaction, Deadline, UInt64, MosaicId} from 'nem2-sdk'
import {Message,formDataConfig, networkConfig, DEFAULT_FEES, FEE_GROUPS, defaultNetworkConfig} from "@/config/index.ts"
import {getAbsoluteMosaicAmount} from '@/core/utils'
import {formDataConfig} from "@/config/view/form";
import {AppWallet, AppMosaic} from "@/core/model"
import {defaultNetworkConfig} from '@/config'

@Component({
    computed: {
        ...mapState({activeAccount: 'account'})
    }
})
export class MosaicEditDialogTs extends Vue {
    activeAccount: StoreAccount
    isCompleteForm = false
    changedSupply = 0
    totalSupply = networkConfig.maxMosaicAtomicUnits
    formItems: any = formDataConfig.mosaicEditForm
    XEM = defaultNetworkConfig.XEM

    @Prop()
    showMosaicEditDialog: boolean

    @Prop()
    itemMosaic: AppMosaic

    get defaultFees() {
      return defaultNetworkConfig.defaultFees
    }

    get feeAmount() {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    get supply() {
        return this.itemMosaic.mosaicInfo.supply.compact()
    }

    get wallet(): AppWallet {
        return this.activeAccount.wallet
    }

    get generationHash(): string {
        return this.activeAccount.generationHash
    }

    get node(): string {
        return this.activeAccount.node
    }

    get xemDivisibility(): number {
        return this.activeAccount.xemDivisibility
    }

    get mosaicId(): string {
      return this.itemMosaic.hex
    }

    get networkType(): NetworkType {
        return this.wallet.networkType
    }

    get defaultFees(): DefaultFee[] {
        return DEFAULT_FEES[FEE_GROUPS.SINGLE]
    }

    get feeAmount(): number {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    mosaicEditDialogCancel() {
        this.initForm()
        this.show = false
    }

    // @TODO: make get newSupply() instead
    changeSupply() {
        this.formItems.delta = Math.abs(this.formItems.delta)
        let supply = 0
        if (this.formItems.supplyType === 1) {
            supply = Number(this.formItems.delta) + Number(this.supply)
            if (supply > this.totalSupply * Math.pow(10, this.formItems['_divisibility'])) {
                supply = this.totalSupply * Math.pow(10, this.formItems['_divisibility'])
                this.formItems.delta = supply - this.supply
            }
        } else {
            supply = this.supply - this.formItems.delta
            if (supply <= 0) {
                supply = 0
                this.formItems.delta = this.supply
            }
        }

        this.changedSupply = supply
    }

    checkInfo() {
        const {formItems} = this

        if (formItems.delta === 0) {
            this.$Notice.error({
                title: '' + this.$t(Message.INPUT_EMPTY_ERROR)
            })
            return false
        }
        if (formItems.password === '') {
            this.$Notice.error({
                title: '' + this.$t(Message.INPUT_EMPTY_ERROR)
            })
            return false
        }

        if (formItems.password.length < 8) {
            this.$Notice.error({
                title: '' + Message.WRONG_PASSWORD_ERROR
            })
            return false
        }

        const validPassword = new AppWallet(this.wallet).checkPassword(new Password(formItems.password))

        if (!validPassword) {
            this.$Notice.error({
                title: '' + Message.WRONG_PASSWORD_ERROR
            })
            return false
        }
        return true
    }

    submit() {
        if (!this.isCompleteForm) return
        if (!this.checkInfo()) return
        this.updateMosaic()
    }

    updateMosaic() {
        const {node, generationHash, feeAmount} = this
        const password = new Password(this.formItems.password)
        const {mosaicId, delta, supplyType, networkType} = this.formItems
        const transaction = new MosaicApiRxjs().mosaicSupplyChange(
            mosaicId,
            delta,
            supplyType,
            networkType,
            feeAmount
        )

        this.mosaicEditDialogCancel
    }

    initForm() {
        this.formItems = formDataConfig.mosaicEditForm
    }

    // @TODO: use v-model
    @Watch('showMosaicEditDialog')
    onShowMosaicEditDialogChange() {
        this.show = this.showMosaicEditDialog
        Object.assign(this.formItems, this.itemMosaic)
    }

    // @TODO: use v-model
    @Watch('itemMosaic')
    onSelectMosaicChange() {
        Object.assign(this.formItems, this.itemMosaic)
    }

    @Watch('formItems', {immediate: true, deep: true})
    onFormItemChange() {
        const {delta, password} = this.formItems
        this.isCompleteForm = parseInt(delta.toString()) >= 0 && password !== ''
    }
}
