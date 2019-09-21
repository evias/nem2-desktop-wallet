import {
    Listener,
    MultisigCosignatoryModification,
    MultisigAccountModificationTransaction,
    CosignatoryModificationAction,
    PublicAccount,
    Deadline,
    UInt64,
} from 'nem2-sdk'
import {mapState} from "vuex"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {Message} from "@/config/index.ts"
import {MultisigApiRxjs} from '@/core/api/MultisigApiRxjs.ts'
import {getAbsoluteMosaicAmount, createBondedMultisigTransaction} from '@/core/utils'
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import { formDataConfig } from '@/config/view/form'

@Component({
    components: {
        CheckPWDialog
    },
    computed: {
        ...mapState({
            activeAccount: 'account',
        })
    }
})
export class MultisigConversionTs extends Vue {
    activeAccount: any
    currentAddress = ''
    isMultisig = false
    isCompleteForm = false
    showCheckPWDialog = false
    transactionDetail = {}
    otherDetails = {}
    transactionList = []
    formItem = formDataConfig.multisigConversionForm

    get publickey() {
        return this.activeAccount.wallet.publicKey
    }

    get currentXEM1() {
        return this.activeAccount.currentXEM1
    }

    get networkType() {
        return this.activeAccount.wallet.networkType
    }

    get address() {
        return this.activeAccount.wallet.address
    }

    get node() {
        return this.activeAccount.node
    }

    get wallet() {
        return this.activeAccount.wallet
    }

    get xemDivisibility() {
        return this.activeAccount.xemDivisibility
    }

    initForm() {
        this.formItem = {
            publickeyList: [],
            minApproval: 1,
            minRemoval: 1,
            bondedFee: 1,
            lockFee: 10,
            innerFee: 1
        }
    }

    addAddress() {
        const {currentAddress} = this
        if (!currentAddress || !currentAddress.trim()) {
            this.showErrorMessage(this.$t(Message.INPUT_EMPTY_ERROR) + '')
            return
        }
        this.formItem.publickeyList.push(currentAddress)
        this.currentAddress = ''
    }

    deleteAddress(index) {
        this.formItem.publickeyList.splice(index, 1)
    }

    confirmInput() {
        // check input data
        if (!this.isCompleteForm) return
        if (!this.checkForm()) return
        const {address} = this.wallet
        const {publickeyList, minApproval, minRemoval, bondedFee, lockFee, innerFee} = this.formItem
        this.transactionDetail = {
            "address": address,
            "min_approval": minApproval,
            "min_removal": minRemoval,
            "cosigner": publickeyList.join(','),
            "fee": innerFee
        }
        this.otherDetails = {
            lockFee: lockFee
        }
        this.initForm()
        this.sendMultisigConversionTransaction()
        this.showCheckPWDialog = true
    }

    showErrorMessage(message: string) {
        this.$Notice.destroy()
        this.$Notice.error({
            title: message
        })
    }

    checkForm(): boolean {
        let {publickeyList, minApproval, minRemoval, bondedFee, lockFee, innerFee} = this.formItem
        if (publickeyList.length < 1) {
            this.showErrorMessage(this.$t(Message.CO_SIGNER_NULL_ERROR) + '')
            return false
        }

        if ((!Number(minApproval) && Number(minApproval) !== 0) || Number(minApproval) < 1) {
            this.showErrorMessage(this.$t(Message.MIN_APPROVAL_LESS_THAN_0_ERROR) + '')
            return false
        }

        if ((!Number(minRemoval) && Number(minRemoval) !== 0) || Number(minRemoval) < 1) {
            this.showErrorMessage(this.$t(Message.MIN_REMOVAL_LESS_THAN_0_ERROR) + '')
            return false
        }

        if (Number(minApproval) > 10) {
            this.showErrorMessage(this.$t(Message.MAX_APPROVAL_MORE_THAN_10_ERROR) + '')
            return false
        }

        if (Number(minRemoval) > 10) {
            this.showErrorMessage(this.$t(Message.MAX_REMOVAL_MORE_THAN_10_ERROR) + '')
            return false
        }
        if ((!Number(innerFee) && Number(innerFee) !== 0) || Number(innerFee) < 0) {
            this.showErrorMessage(this.$t(Message.FEE_LESS_THAN_0_ERROR) + '')
            return false
        }

        if ((!Number(bondedFee) && Number(bondedFee) !== 0) || Number(bondedFee) < 0) {
            this.showErrorMessage(this.$t(Message.FEE_LESS_THAN_0_ERROR) + '')
            return false
        }

        if ((!Number(lockFee) && Number(lockFee) !== 0) || Number(lockFee) < 0) {
            this.showErrorMessage(this.$t(Message.FEE_LESS_THAN_0_ERROR) + '')
            return false
        }

        const publickeyFlag = publickeyList.every((item) => {
            if (item.trim().length !== 64) {
                this.showErrorMessage(this.$t(Message.ILLEGAL_PUBLICKEY_ERROR) + '')
                return false
            }
            return true
        })
        return publickeyFlag
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = false
    }

    checkEnd(isPasswordRight) {
        if (!isPasswordRight) {
            this.$Notice.destroy()
            this.$Notice.error({
                title: this.$t(Message.WRONG_PASSWORD_ERROR) + ''
            })
        }
    }

    getMultisigAccountList() {
        const that = this
        if (!this.wallet) return
        const {node, address} = this
        new MultisigApiRxjs().getMultisigAccountInfo(
            address,
            node
        ).subscribe((multisigInfo) => {
            if (multisigInfo.cosignatories.length !== 0) {
                that.isMultisig = true
            }
        })
    }

    sendMultisigConversionTransaction() {
        const {xemDivisibility} = this
        // here lock fee should be relative param
        let {publickeyList, minApproval, minRemoval, lockFee, bondedFee, innerFee} = this.formItem
        bondedFee = getAbsoluteMosaicAmount(bondedFee, xemDivisibility)
        innerFee = getAbsoluteMosaicAmount(innerFee, xemDivisibility)
        const {networkType, node, publickey} = this
        const listener = new Listener(node.replace('http', 'ws'), WebSocket)

        const multisigCosignatoryModificationList = publickeyList
            .map(cosigner => new MultisigCosignatoryModification(
                CosignatoryModificationAction.Add,
                PublicAccount.createFromPublicKey(cosigner, networkType),
            ))

        const modifyMultisigAccountTransaction = MultisigAccountModificationTransaction.create(
            Deadline.create(),
            minApproval,
            minRemoval,
            multisigCosignatoryModificationList,
            networkType,
            UInt64.fromUint(innerFee)
        )

        const aggregateTransaction = createBondedMultisigTransaction(
            [modifyMultisigAccountTransaction],
            publickey,
            networkType,
            bondedFee,
        )

        this.otherDetails = {
            lockFee
        }
        this.transactionList = [aggregateTransaction]
    }

    @Watch('formItem', {immediate: true, deep: true})
    onFormItemChange() {
        const {publickeyList, minApproval, minRemoval, bondedFee, lockFee, innerFee} = this.formItem
        // isCompleteForm
        this.isCompleteForm = publickeyList.length !== 0 && minApproval + '' !== '' && minRemoval + '' !== '' && innerFee + '' !== '' && bondedFee + '' !== '' && lockFee + '' !== ''
        return
    }

    // @TODO multisig account list at higher level
    mounted() {
        this.getMultisigAccountList()
    }
}
