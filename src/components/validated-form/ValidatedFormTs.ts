import {mapState} from "vuex"
import {Component, Vue, Prop} from 'vue-property-decorator'
import { ValidationProvider, ValidationObserver } from 'vee-validate';

// internal dependencies
import {StoreAccount} from "@/core/model"

@Component({
    components: {
        ValidationObserver,
        ValidationProvider,
    },
    computed: {
        ...mapState({activeAccount: 'account'}),
    },
    data: () => {},
    methods: {
        onSubmit () {
            throw new Error('onSubmit() must be overloaded');
        },
        resetForm () {
            throw new Error('resetForm() must be overloaded');
        }
    }
})
export class ValidatedFormTs extends Vue {
    activeAccount: StoreAccount
}
