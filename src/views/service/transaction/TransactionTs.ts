import {Component, Vue} from 'vue-property-decorator'
import TransactionList from './transaction-function/transaction-list/TransactionList.vue'
import MonitorTransfer from '@/views/monitor/monitor-transfer/MonitorTransfer.vue'
import {mapState} from "vuex"
import {transactionButtonConfig} from "@/config/view/transaction";
import {StoreAccount} from "@/core/model"

@Component({
    components: {
        TransactionList,
        MonitorTransfer
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class TransactionTs extends Vue {
    buttonList = transactionButtonConfig
    activeAccount:StoreAccount

    get node() {
        return this.activeAccount.node
    }

    get getWallet() {
        return this.activeAccount.wallet
    }

    switchButton(index) {
        let list = this.buttonList
        list = list.map((item) => {
            item.isSelected = false
            return item
        })
        list[index].isSelected = true
        this.buttonList = list
    }


}
