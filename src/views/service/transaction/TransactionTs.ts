import {Component, Vue} from 'vue-property-decorator'
import TransactionList from './components/TransactionList.vue'
import TransferPage from './pages/TransferPage.vue'
import MosaicDefinitionPage from './pages/MosaicDefinitionPage.vue'
import {mapState} from "vuex"
import {StoreAccount} from "@/core/model"

@Component({
    components: {
        TransactionList,
        TransferPage,
        MosaicDefinitionPage
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
            name: 'tab_create_transfer',
            isSelected: false,
            path: 'createTransferPage'
        },
        {
            name: 'tab_create_mosaic',
            isSelected: false,
            path: 'createMosaicPage'
        },
        {
            name: 'tab_read_uri',
            isSelected: false,
            path: 'readTransactionURI'
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
