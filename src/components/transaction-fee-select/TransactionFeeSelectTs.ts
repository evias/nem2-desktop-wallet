import {mapState} from "vuex"
import {Component, Vue, Prop} from 'vue-property-decorator'

// internal dependencies
import FormInput from '@/views/other/forms/input/FormInput.vue'
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs"
import {StoreAccount} from '@/core/model'

@Component({
    components: {
        FormInput,
    },
    computed: {...mapState({activeAccount: 'account'})},
    data: () => {
        fee: ''
    }
})
export class TransactionFeeSelectTs extends Vue {
    activeAccount: StoreAccount
    feeGroups: Object[] = [
        {speed: "small", amount: 0.05},
        {speed: "mediun", amount: 0.1},
        {speed: "high", amount: 1},
    ]

    @Prop({default: () => null})
    feeMultiplier: Number
}
