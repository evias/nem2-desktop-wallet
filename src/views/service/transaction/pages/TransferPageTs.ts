import {TransactionType} from 'nem2-sdk'
import {Component, Vue} from 'vue-property-decorator'
import CollectionRecord from '@/views/service/transaction/components/CollectionRecord.vue';
import PageTutorial from '@/common/vue/page-tutorial/PageTutorial.vue'
import TransferForm from '@/views/service/transaction/forms/TransferForm.vue'
import {mapState} from "vuex"
import {TransferType} from "@/core/model/TransferType";
import {transferPageTypeConfig} from '@/config/view/monitor'
import {StoreAccount} from "@/core/model"

@Component({
    components: {
        TransferForm,
        CollectionRecord,
        PageTutorial,
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class TransferPageTs extends Vue {
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

    switchTransferType(index) {
        const list: any = this.transferTypeList
        if (list[index].disabled) {
            return
        }
        list.map((item) => {
            item.isSelect = false
            return item
        })
        list[index].isSelect = true
        this.transferTypeList = list
    }

}
