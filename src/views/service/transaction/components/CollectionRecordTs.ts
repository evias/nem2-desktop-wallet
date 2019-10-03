import {Address, TransactionType, Transaction, TransferTransaction} from 'nem2-sdk'
import {mapState} from "vuex"
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {
    getCurrentMonthFirst, getCurrentMonthLast, formatNumber,
    renderMosaics, renderMosaicNames, renderMosaicAmount
} from '@/core/utils'
import TransactionModal from '@/views/monitor/monitor-transaction-modal/TransactionModal.vue'
import {TransferType} from "@/core/model/TransferType"
import {StoreAccount, AppInfo, FormattedTransaction} from "@/core/model"

@Component({
    computed: {...mapState({activeAccount: 'account', app: 'app'})},
    components: { TransactionModal },
    props: {
        leftMargin: Boolean
    }
})
export class CollectionRecordTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    transactionSearch = ''
    displayedTransactions: Array<FormattedTransaction> = []
    transactionType = TransactionType
    transferType = TransferType
    renderMosaics = renderMosaics
    renderMosaicNames = renderMosaicNames
    renderMosaicAmount = renderMosaicAmount
    pageSize: number = 10
    page: number = 1

    showDialog: boolean = false
    activeTransaction: FormattedTransaction = null

    @Prop({
        default: () => {
            return TransactionType.TRANSFER
        }
    })
    filterType

    @Prop({
        default: () => {
            return TransferType.SENT
        }
    })
    filterOrigin

    get wallet() {
        return this.activeAccount.wallet
    }

    get transactionsLoading() {
        return this.app.transactionsLoading
    }

    get transactionList() {
        return this.activeAccount.transactionList
    }

    get transactionListFilteredByType() {
        const {filterType, filterOrigin, transactionList} = this;

        return transactionList.filter(({rawTx}) => rawTx.type === filterType)
                                   .filter(({rawTx, txHeader}) => {
            if (rawTx.type !== TransactionType.TRANSFER) {
                return true;
            }

            return this.filterOrigin === TransferType.SENT ? !txHeader.isReceipt : txHeader.isReceipt;
        })
    }

    get pagedTransactionList() {
        const start = (this.page - 1) * this.pageSize
        const end = this.page * this.pageSize
        return [...this.transactionListFilteredByType].slice(start, end)
    }

    get mosaicList() {
        return this.activeAccount.mosaics
    }

    get currentXem() {
        return this.activeAccount.currentXem
    }

    get currentHeight() {
        return this.app.chainStatus.currentHeight
    }

    // @TODO: move to formatTransactions
    formatNumber(number) {
        return formatNumber(number)
    }
}
