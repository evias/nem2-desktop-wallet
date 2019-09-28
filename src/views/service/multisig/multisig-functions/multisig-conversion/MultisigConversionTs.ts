import {
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
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import { formDataConfig } from '@/config/view/form'
import {createBondedMultisigTransaction, StoreAccount} from "@/core/model"
import {getAbsoluteMosaicAmount} from "@/core/utils"
import {defaultNetworkConfig} from '@/config'

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
    activeAccount: StoreAccount
    currentAddress = ''
    isCompleteForm = false
    showCheckPWDialog = false
    transactionDetail = {}
    otherDetails = {}
    transactionList = []
    formItems = formDataConfig.multisigConversionForm

    get wallet(): AppWallet {
        return this.activeAccount.wallet
    }

    get publicKey() {
        return this.activeAccount.wallet.publicKey
    }

    get currentXEM1() {
        return this.activeAccount.currentXEM1
    }

    get networkType() {
        return this.activeAccount.wallet.networkType
    }

    get multisigInfo(): MultisigAccountInfo {
        const {address} = this.wallet
        return this.activeAccount.multisigAccountInfo[address]
    }

    get isMultisig(): boolean {
        if (!this.multisigInfo) return false
        return this.multisigInfo.cosignatories.length > 0
    }

    get address(): string {
        return this.activeAccount.wallet.address
    }

    get xemDivisibility(): number {
        return this.activeAccount.xemDivisibility
    }

    get node(): string {
        return this.activeAccount.node
    }

    get defaultFees(): DefaultFee[] {
        return DEFAULT_FEES[FEE_GROUPS.TRIPLE]
    }

    get announceInLock(): boolean {
        return true
    }

    get feeAmount(): number {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }

    get feeDivider(): number {
        return 3
    }

    get defaultFees() {
        return defaultNetworkConfig.defaultAggregateFees
    }
    
    get feeAmount() {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }
  
    initForm() {
        this.formItems = formDataConfig.multisigConversionForm
    }

    addAddress() {
        const {currentAddress} = this
        if (!currentAddress || !currentAddress.trim()) {
            this.showErrorMessage(this.$t(Message.INPUT_EMPTY_ERROR) + '')
            return
        }
        this.formItems.publickeyList.push(currentAddress)
        this.currentAddress = ''
    }

    deleteAdress(index) {
        this.formItems.publickeyList.splice(index, 1)
    }

    confirmInput() {
        // check input data
        if (!this.isCompleteForm) return
        if (!this.checkForm()) return
        const {address} = this.wallet
        const {publickeyList, minApproval, minRemoval} = this.formItems
        const {feeAmount} = this 
        this.transactionDetail = {
            "address": address,
            "min_approval": minApproval,
            "min_removal": minRemoval,
            "cosigner": publickeyList.join(','),
            "fee": feeAmount/3*2
        }
        this.otherDetails = {
            lockFee: feeAmount/3
        }
        this.sendMultisigConversionTransaction()
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
        let {publickeyList, minApproval, minRemoval} = this.formItems
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

        const publicKeyFlag = publicKeyList.every((item) => {
            if (item.trim().length !== 64) {
                this.showErrorMessage(this.$t(Message.ILLEGAL_PUBLIC_KEY_ERROR) + '')
                return false
            }
            return true
        })
        return publicKeyFlag
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

    sendMultisignConversionTransaction() {
        // here lock fee should be relative param
        let {publickeyList, minApproval, minRemoval} = this.formItems
        const {feeAmount} = this
        const bondedFee = feeAmount/3
        const innerFee = feeAmount/3
        const {networkType, publickey} = this
        const multisigCosignatoryModificationList = publickeyList.map(cosigner => new MultisigCosignatoryModification(
            MultisigCosignatoryModificationType.Add,
            PublicAccount.createFromPublicKey(cosigner, networkType),
        ))

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
            publicKey,
            networkType,
            bondedFee,
        )

        this.otherDetails = {
            lockFee: feeAmount/3
        }
        this.transactionList = [aggregateTransaction]
    }

    @Watch('formItems', {immediate: true, deep: true})
    onFormItemChange() {
        const {publickeyList, minApproval, minRemoval} = this.formItems
        const {feeAmount} = this
        // isCompleteForm
        this.isCompleteForm = publickeyList.length !== 0 && minApproval + '' !== '' && minRemoval + '' !== '' && feeAmount + '' !== ''
        return
    }
}
