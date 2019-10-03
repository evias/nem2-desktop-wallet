import {mapState} from "vuex"
import {Component, Provide, Vue, Watch} from 'vue-property-decorator'
import ErrorTooltip from '@/views/other/forms/errorTooltip/ErrorTooltip.vue'
import FormInput from '@/views/other/forms/input/FormInput.vue'
import { 
    Transaction,
    TransactionMapping,
    PublicAccount,
} from 'nem2-sdk';
import {StoreAccount} from "@/core/model"
import { TransactionFormTs } from './TransactionFormTs';
import * as validatorRules from './BaseValidationRules';
import { ValidationProvider } from 'vee-validate';

@Component({
    components: {
        FormInput,
        ValidationProvider,
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
            app: 'app'
        }),
        canSubmit: async function () {
            return await this.$validator.validate();
        }
    },
    data: () => ({
        payload: '',
    })
})
export class TransactionURIFormTs extends TransactionFormTs {

    async mounted() {}

    resetForm() {
        this.payload = '';
    }

    prepareTransactions(): Array<Transaction> {

        // verify payload content
        const transaction = TransactionMapping.createFromPayload(this.payload)

        //@TODO sanity checks for payload

        // return resulting transaction list
        this.transactionList.push(transaction)
        return this.transactionList;
    }

    readSignerAddress(transaction: Transaction) {

        if (transaction.signer) {
            return transaction.signer.address.plain()
        }

        return '';
    }
}
