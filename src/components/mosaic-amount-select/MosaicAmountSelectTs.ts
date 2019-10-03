import {mapState} from "vuex"
import {Component, Vue, Prop, Watch} from 'vue-property-decorator'
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { Address, MosaicId, MultisigAccountInfo, NamespaceId, PublicAccount, MosaicAmountView, UInt64, } from 'nem2-sdk'

// internal dependencies
import FormInput from '@/views/other/forms/input/FormInput.vue'
import {MosaicApiRxjs} from "@/core/api/MosaicApiRxjs"
import {StoreAccount} from '@/core/model'
import {mosaicsAmountViewFromAddress} from '@/core/services/mosaics'

@Component({
    components: {
        FormInput,
    },
    computed: {...mapState({activeAccount: 'account'})},
    data: () => {
        mosaics: []
    }
})
export class MosaicAmountSelectTs extends Vue {
    activeAccount: StoreAccount
    mosaicsOwned: Map<string, MosaicAmountView>
    mosaicsAdded: Map<string, MosaicAmountView>
    currentMosaicId: MosaicId
    relativeAmount: number

    @Prop({default: () => null})
    ownerAccount: PublicAccount

    @Prop({default: () => null})
    currencyMosaicId: MosaicId

    async mounted() {
        const owned = await mosaicsAmountViewFromAddress(
            this.activeAccount.node,
            this.ownerAccount.address
        )

        owned.map((mosaicAmountView) => {
            const idToHex = mosaicAmountView.mosaicInfo.id.toHex()
            this.mosaicsOwned.set(idToHex, mosaicAmountView)
        })
    }

    getMosaicName(mosaicAmountView) {
        const id = mosaicAmountView.mosaicInfo.id

        //XXX should not be static
        if (id.toHex() === this.currencyMosaicId.toHex()) {
            return 'nem.xem (' + id.toHex() + ')'
        }

        return id.toHex();
    }

    toRelativeAmount(mosaicAmountView): Number {
        const id = mosaicAmountView.mosaicInfo.id
        const amount = mosaicAmountView.amount.compact()

        if (! amount) return 0

        // format amount
        return this.mosaicsOwned.get(id.toHex()).relativeAmount()
    }

    addMosaic() {
        const mosaicId = this.currentMosaicId
        const addedAmount = this.relativeAmount

        // mosaic "unknown"
        if (!mosaicId || !addedAmount || ! this.mosaicsOwned.has(mosaicId.toHex())) {
            return 
        }

        // get absolute amount
        const mosaicInfo = this.mosaicsOwned.get(mosaicId.toHex()).mosaicInfo
        const multiplier: number = Math.pow(10, mosaicInfo.divisibility)
        const absolute: number = addedAmount * multiplier

        // encode format
        const totalAmount: number = this.mosaicsAdded.has(mosaicId.toHex()) 
                          ? this.mosaicsAdded.get(mosaicId.toHex()).amount.compact() + absolute
                          : absolute

        this.mosaicsAdded.set(
            mosaicId.toHex(), 
            new MosaicAmountView(mosaicInfo, UInt64.fromUint(totalAmount)))
        this.$emit('addedMosaicsChanged', this.mosaicsAdded)
    }

    removeMosaic(mosaicIdHex) {
        // mosaic "unknown"
        if (! mosaicIdHex || ! this.mosaicsOwned.has(mosaicIdHex)
                          || ! this.mosaicsAdded.has(mosaicIdHex)) {
            return 
        }

        this.mosaicsAdded.delete(mosaicIdHex)
        this.$emit('addedMosaicsChanged', this.mosaicsAdded)
    }

    @Watch('addedMosaicsChanged')
    onAddedMosaicsChanged(newMosaics) {
        this.mosaicsAdded = newMosaics
    }
}

