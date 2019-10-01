import {mapState} from "vuex"
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {StoreAccount, AppInfo, FormattedTransaction} from "@/core/model"

@Component({
    computed: {...mapState({activeAccount: 'account', app: 'app'})},
    props: {
        pageTitle: {type: String, required: true},
        titles: {type: Array, required: true},
        explanations: {type: Array, required: true},
    }
})
export class PageTutorialTs extends Vue {
    activeAccount: StoreAccount
    app: AppInfo
}
