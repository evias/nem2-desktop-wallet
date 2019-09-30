import {Component, Vue} from 'vue-property-decorator'
import TransactionList from './transaction-list/TransactionList.vue'
import TransferPage from './transfer-page/TransferPage.vue'
import {mapState} from "vuex"
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
    navigatorList: Array<{
        name: string,
        isSelected: boolean,
        path: string
    }> = [
        {
            name: 'Transaction_list',
            isSelected: true,
            path: 'transactionList'
        },
        {
            name: 'transfer',
            isSelected: false,
            path: 'transferPage'
        }
    ]

    activeAccount:StoreAccount

    get node() {
        return this.activeAccount.node
    }

    get getWallet() {
        return this.activeAccount.wallet
    }

    switchPanel(index) {
        const list = this.navigatorList.map((item) => {
            item.isSelected = false
            return item
        })
        list[index].isSelected = true
        this.navigatorList = list
        this.$router.push({
            name: list[index].path
        })
    }

    mounted() {
        this.switchPanel(0)
    }

}
