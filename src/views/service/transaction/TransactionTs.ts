import {Component, Vue} from 'vue-property-decorator'
import TransactionList from './transaction-list/TransactionList.vue'
import TransferPage from './transfer-page/TransferPage.vue'
import {mapState} from "vuex"
import {transactionButtonConfig} from "@/config/view/transaction";
import {StoreAccount} from "@/core/model"

@Component({
    components: {
        TransactionList,
        TransferPage
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
