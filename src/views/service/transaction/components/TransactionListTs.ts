import {TransactionType} from 'nem2-sdk'
import {mapState} from "vuex"
import {Component, Vue} from 'vue-property-decorator'
import {formatNumber, renderMosaics} from '@/core/utils'
import {FormattedTransaction, AppInfo, StoreAccount} from '@/core/model'
import TransactionModal from '@/views/monitor/monitor-transaction-modal/TransactionModal.vue'
import {defaultNetworkConfig} from '@/config/index'
import PageTutorial from '@/common/vue/page-tutorial/PageTutorial.vue'

@Component({
    computed: {...mapState({activeAccount: 'account', app: 'app'})},
    components: {TransactionModal, PageTutorial},
    props: {
        isMinimized: Boolean
    }
})
export class TransactionListTs extends Vue {
    app: AppInfo
    activeAccount: StoreAccount
    pageSize: number = 10
    highestPrice = 0
    isLoadingModalDetailsInfo = false
    page: number = 1
    formatNumber = formatNumber
    renderMosaics = renderMosaics
    TransactionType = TransactionType
    scroll: any
    showDialog: boolean = false
    activeTransaction: FormattedTransaction = null

    get wallet() {
        return this.activeAccount.wallet
    }

    get transactionsLoading() {
        return this.app.transactionsLoading
    }

    get transactionList() {
        return this.activeAccount.transactionList
    }

    get mosaicList() {
        return this.activeAccount.mosaics
    }

    get slicedTransactionList() {
        const start = (this.page - 1) * this.pageSize
        const end = this.page * this.pageSize
        return [...this.transactionList].slice(start, end)
    }

    get currentHeight() {
        return this.app.chainStatus.currentHeight
    }

    get currentXem() {
        return this.activeAccount.currentXem
    }

    // @TODO: move out from there
    renderHeightAndConfirmation(height) {
        const {currentHeight} = this
        if (!currentHeight) return height
        const confirmations = currentHeight - height
        const {networkConfirmations} = defaultNetworkConfig
        if (confirmations > networkConfirmations) return height.toLocaleString()
        return `(${confirmations}/${networkConfirmations}) - ${height.toLocaleString()}`
    }

    // @TODO: move out from there
    miniHash(hash: string): string {
        return `${hash.substring(0, 18).toLowerCase()}...${hash.substring(49).toLowerCase()}`
    }

    // @TODO: Changing tab should reset the newly selected tab's pagination to 1
    async changePage(page) {
        this.page = page
        this.scrollTop()
    }

    divScroll(div) {
        this.scroll = div
    }

    scrollTop() {
        this.scroll.target.scrollTop = 0
    }
}
