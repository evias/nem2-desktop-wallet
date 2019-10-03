import {mapState} from "vuex"
import {Component, Vue, Prop} from 'vue-property-decorator'
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { Address, MultisigAccountInfo } from 'nem2-sdk'

// internal dependencies
import {StoreAccount} from "@/core/model"

@Component({
    components: {},
    computed: {
        ...mapState({activeAccount: 'account'}),
    },
    data: () => {
        signerPublicKey: ''
    }
})
export class SignerAccountSelectTs extends Vue {
    activeAccount: StoreAccount
    signerPublicKey: string = this.activeAccount.wallet.publicKey

    get multisigInfo(): MultisigAccountInfo {
        const {address} = this.activeAccount.wallet
        return this.activeAccount.multisigAccountInfo[address]
    }

    get hasMultisigAccounts(): Boolean {
        if (!this.multisigInfo) return false
        return this.multisigInfo.multisigAccounts.length > 0
    }

    get multisigPublicKeyList(): {publicKey: string, address: string}[] {
        if (!this.hasMultisigAccounts) return null

        const address = Address.createFromRawAddress(this.activeAccount.wallet.address)
        const networkType = this.activeAccount.wallet.networkType
        return [
            // first display simple account
            {
                publicKey: this.activeAccount.wallet.publicKey,
                address: `(Simple) ${address.pretty()}`,
            },
            // then display multisig accounts
            ...this.multisigInfo.multisigAccounts.map(
                ({publicKey}) => {
                    const addr = Address.createFromPublicKey(publicKey, networkType).pretty()

                    return ({
                        publicKey,
                        address: addr
                    })
                }),
        ]
    }

    onChange(value) {
        this.$emit('signerAccountChanged', this.signerPublicKey)
    }
}
