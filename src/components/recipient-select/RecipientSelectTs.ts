import {mapState} from "vuex"
import {Component, Vue, Prop} from 'vue-property-decorator'
import { NamespaceId, Address } from 'nem2-sdk'

// internal dependencies
import FormInput from '@/views/other/forms/input/FormInput.vue'
import {NamespaceApiRxjs} from "@/core/api/NamespaceApiRxjs"
import {StoreAccount} from '@/core/model'

@Component({
    components: {
        FormInput,
    },
    computed: {...mapState({activeAccount: 'account'})},
    data: () => {
        recipient: ''
    }
})
export class RecipientSelectTs extends Vue {
    activeAccount: StoreAccount

    isPublicKey(input): Boolean {
        return /^[A-Ha-h0-9]{64}/.test(input)
    }

    isAddress(input): Boolean {
        return /^[A-Za-z0-9\-]{40,45}/.test(input)
    }

    addressByPublicKey(publicKey: string): Address {
        return Address.createFromPublicKey(publicKey, this.activeAccount.wallet.networkType)
    }

    async addressByNamespace(namespace: string): Address | Boolean {
        // try to resolve address with namespace name
        const node = this.activeAccount.node
        try {
            const api = new NamespaceApiRxjs()
            const address = await api.getLinkedAddress(new NamespaceId(this.recipient), node)

            // we got an address, format
            return this.recipient = address.pretty()
        }
        catch (e) {
            // silent about not finding namespace, aggressive only later
        }

        return false
    }

    async resolveInput() {
        const recipient = this.recipient

        // 1) check if already got address
        if (this.isAddress(recipient)) {
            // already an address
            return 
        }

        // 2) resolve address by public key
        if (this.isPublicKey(recipient)) {
            return this.recipient = this.addressByPublicKey(recipient).pretty()
        }

        // 3) resolve address by public key
        const address = await this.addressByNamespace(recipient)
        if (address === false) {
            // couldn't find an alias for this namespace
            return 
        }

        return this.recipient = (address as Address).pretty()
    }
}
