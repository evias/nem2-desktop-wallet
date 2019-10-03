import {TransactionType} from 'nem2-sdk'
import {Component, Vue} from 'vue-property-decorator'
import CollectionRecord from '@/views/service/transaction/components/CollectionRecord.vue';
import PageTutorial from '@/common/vue/page-tutorial/PageTutorial.vue'
import MosaicDefinitionForm from '@/views/service/transaction/forms/MosaicDefinitionForm.vue'
import {mapState} from "vuex"
import {TransferType} from "@/core/model/TransferType";
import {transferPageTypeConfig} from '@/config/view/monitor'
import {StoreAccount} from "@/core/model"

@Component({
    components: {
        MosaicDefinitionForm,
        CollectionRecord,
        PageTutorial,
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class MosaicDefinitionPageTs extends Vue {
    activeAccount: StoreAccount
    transactionType = TransactionType
    transferType = TransferType
    transferTypeList = transferPageTypeConfig
    currentPrice = 0

    get getWallet() {
        return this.activeAccount.wallet
    }

    get accountAddress() {
        return this.activeAccount.wallet.address
    }

    get node() {
        return this.activeAccount.node
    }

}
