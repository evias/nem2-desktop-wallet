import {Component, Vue} from 'vue-property-decorator'
import CollectionRecord from '@/common/vue/collection-record/CollectionRecord.vue'
import TransferForm from '@/views/service/transaction/transaction-forms/TransferForm.vue'
import {mapState} from "vuex"
import {TransferType} from "@/core/model/TransferType";
import {transferPageTypeConfig} from '@/config/view/monitor'
import {StoreAccount} from "@/core/model"

@Component({
    components: {
        TransferForm,
        CollectionRecord,
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class TransferPageTs extends Vue {
    activeAccount: StoreAccount
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

    showSearchDetail() {
        // this.isShowSearchDetail = true
    }

    hideSearchDetail() {

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
