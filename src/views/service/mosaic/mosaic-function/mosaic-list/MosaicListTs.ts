import {mapState} from "vuex"
import {Address, AliasType, MosaicId} from "nem2-sdk"
import {Component, Vue, Watch} from 'vue-property-decorator'
import EditDialog from './mosaic-edit-dialog/MosaicEditDialog.vue'
import MosaicAliasDialog from './mosaic-alias-dialog/MosaicAliasDialog.vue'
import MosaicUnAliasDialog from './mosaic-unAlias-dialog/MosaicUnAliasDialog.vue'
import {formatNumber} from '@/core/utils'
import {mosaicSortType} from "@/config/view/mosaic"
import {networkConfig} from "@/config"
import {MosaicNamespaceStatusType, StoreAccount, AppInfo, AppMosaic} from "@/core/model"
import PageTutorial from '@/common/vue/page-tutorial/PageTutorial.vue'

@Component({
    components: {
        MosaicAliasDialog,
        MosaicUnAliasDialog,
        EditDialog,
        PageTutorial
    },
    computed: {...mapState({activeAccount: 'account', app: 'app'})},
})
export class MosaicListTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
    isLoadingConfirmedTx = false
    currentTab: number = 0
    currentPage: number = 1
    pageSize: number = networkConfig.namespaceListSize
    rootNameList: any[] = []
    screenMosaic: any = {}
    showCheckPWDialog = false
    showMosaicEditDialog = false
    showMosaicAliasDialog = false
    showMosaicUnAliasDialog = false
    mosaicMapInfo: any = {}
    selectedMosaic: AppMosaic = null
    currentSortType = mosaicSortType.byId
    mosaicSortType = mosaicSortType
    currentMosaicList = []
    isShowExpiredMosaic = false

    get currentXem() {
        return this.activeAccount.currentXem
    }

    get mosaics() {
        return this.activeAccount.mosaics
    }

    get currentXEM1() {
        return this.activeAccount.currentXEM1
    }

    get generationHash() {
        return this.activeAccount.generationHash
    }

    get accountAddress() {
        return this.activeAccount.wallet.address
    }

    get node() {
        return this.activeAccount.node
    }

    get getWallet() {
        return this.activeAccount.wallet
    }

    get nowBlockHeight() {
        return this.app.chainStatus.currentHeight
    }

    get mosaicsLoading() {
        return this.app.mosaicsLoading
    }

    get namespaceMap() {
        let namespaceMap = {}
        this.activeAccount.namespaces.forEach((item) => {
            switch (item.alias.type) {
                case (AliasType.Address):
                    //@ts-ignore
                    namespaceMap[Address.createFromEncoded(item.alias.address).address] = item
                    break
                case (AliasType.Mosaic):
                    namespaceMap[new MosaicId(item.alias.mosaicId).toHex()] = item
            }
        })
        return namespaceMap
    }

    get publicKey() {
        return this.activeAccount.wallet.publicKey
    }

    get currentHeight() {
        return this.app.chainStatus.currentHeight
    }

    toggleChange(page) {
        this.currentPage = page
    }

    formatNumber(number) {
        return formatNumber(number)
    }

    showAliasDialog(item) {
        this.selectedMosaic = item
        this.showMosaicAliasDialog = true
    }

    showUnAliasDialog(item) {
        this.selectedMosaic = item
        this.showMosaicUnAliasDialog = true
    }


    showEditDialog(item) {
        this.selectedMosaic = item
        this.showMosaicEditDialog = true
    }


    computeDuration(item) {
        if (!item.mosaicInfo) return 'Loading...'
        const {properties, height} = item.mosaicInfo
        if (properties.duration.compact() === 0) return 'Forever'
        return (height.compact() + properties.duration.compact()) - this.nowBlockHeight
    }

    getSortType(type) {
        this.currentSortType = type
        const currentMosaicList = [...this.currentMosaicList]
        switch (type) {
            case mosaicSortType.byId:
                this.currentMosaicList = sortByMosaicId(currentMosaicList)
                break
            case mosaicSortType.byDuration:
                this.currentMosaicList = sortByMosaicDuration(currentMosaicList)
                break
            case mosaicSortType.byAlias:
                this.currentMosaicList = sortByMosaicAlias(currentMosaicList)
                break
            case mosaicSortType.byRestrictable:
                this.currentMosaicList = sortByMosaicRestrictable(currentMosaicList)
                break
            case mosaicSortType.bySupply:
                this.currentMosaicList = sortByMosaicSupply(currentMosaicList)
                break
            case mosaicSortType.byTransferable:
                this.currentMosaicList = sortByMosaicTransferable(currentMosaicList)
                break
            case mosaicSortType.byDivisibility:
                this.currentMosaicList = sortByMosaicDivisibility(currentMosaicList)
                break
            case mosaicSortType.bySupplyMutable:
                this.currentMosaicList = sortByMosaicSupplyMutable(currentMosaicList)
                break
        }
    }

    toggleIsShowExpiredMosaic() {
        const {isShowExpiredMosaic, currentHeight} = this
        const list = Object.values(this.mosaics)
        this.currentMosaicList = list.filter((item: any) => isShowExpiredMosaic || item.expirationHeight == MosaicNamespaceStatusType.FOREVER || item.expirationHeight > currentHeight)
        this.isShowExpiredMosaic = !isShowExpiredMosaic
    }

    intiMosaics() {
        this.getSortType(this.currentSortType)
        this.currentMosaicList = Object.values(this.mosaics)
    }

    @Watch('mosaics', {deep: true})
    onMosiacsChange() {
        this.intiMosaics()
    }

    mounted() {
        this.intiMosaics()
    }


}
