import {Component, Vue, Prop, Watch} from 'vue-property-decorator'
import {mapState} from "vuex"
import {Password} from 'nem2-sdk'
import {Message, networkConfig} from "@/config/index.ts"
import {MosaicApiRxjs} from "@/core/api/MosaicApiRxjs.ts"
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
    show = false
    activeAccount: any
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

    mosaicEditDialogCancel() {
        this.initForm()
        this.$emit('closeMosaicEditDialog')
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
        this.show = false
        new AppWallet(this.wallet)
            .signAndAnnounceNormal(password, node, generationHash, [transaction], this)
    }

    updatedMosaic() {
        this.show = false
        this.mosaicEditDialogCancel()
        this.$Notice.success({
            title: this.$t('mosaic_operation') + '',
            desc: this.$t('update_completed') + ''
        })
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
