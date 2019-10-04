import {mapState} from "vuex"
import {Component, Vue, Watch} from 'vue-property-decorator'
import {
    MultisigAccountModificationTransaction,
    CosignatoryModificationAction,
    MultisigCosignatoryModification,
    PublicAccount,
    Deadline,
    UInt64
} from 'nem2-sdk'
import {
    getAbsoluteMosaicAmount,
} from "@/core/utils"
import {Message, DEFAULT_FEES, FEE_GROUPS, formDataConfig} from "@/config"
import CheckPWDialog from '@/common/vue/check-password-dialog/CheckPasswordDialog.vue'
import {createBondedMultisigTransaction, createCompleteMultisigTransaction, StoreAccount, DefaultFee} from "@/core/model"

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
export class MultisigManagementTs extends Vue {
    activeAccount: StoreAccount
    isShowPanel = true
    transactionList = []
    currentPublicKey = ''
    currentMinRemoval = 0
    otherDetails: any = {}
    currentMinApproval = 0
    hasAddCosigner = false
    isCompleteForm = false
    existsCosignerList = [{}]
    showCheckPWDialog = false
    currentCosignatoryList = []
    showSubpublickeyList = false
    CosignatoryModificationAction = CosignatoryModificationAction
    publickeyList = []

    formItem = formDataConfig.multisigManagementForm

    get currentXEM1() {
        return this.activeAccount.currentXEM1
    }

    get publicKey() {
        return this.activeAccount.wallet.publicKey
    }

    get networkType() {
        return this.activeAccount.wallet.networkType
    }

    get generationHash() {
        return this.activeAccount.generationHash
    }

    get address() {
        return this.activeAccount.wallet.address
    }

    get node() {
        return this.activeAccount.node
    }

    get xemDivisibility() {
        return this.activeAccount.xemDivisibility
    }

    get defaultFees(): DefaultFee[] {
        return DEFAULT_FEES[FEE_GROUPS.SINGLE]
    }
    
    get feeAmount() {
        const {feeSpeed} = this.formItems
        const feeAmount = this.defaultFees.find(({speed})=>feeSpeed === speed).value
        return getAbsoluteMosaicAmount(feeAmount, this.xemDivisibility)
    }
  
    addCosigner(flag) {
        const {currentPublicKey} = this
        if (!currentPublicKey || !currentPublicKey.trim()) {
            this.showErrorMessage(this.$t(Message.INPUT_EMPTY_ERROR) + '')
            return
        }
        this.formItems.cosignerList.push({
            publicKey: currentPublicKey,
            type: flag
        })
        this.currentPublicKey = ''
    }

    removeCosigner(index) {
        this.formItems.cosignerList.splice(index, 1)
    }

    closeCheckPWDialog() {
        this.showCheckPWDialog = false
    }

    confirmInput() {
        if (!this.isCompleteForm) return
        if (!this.checkForm()) return
        this.otherDetails = {
            lockFee: this.feeAmount/3
        }
        const {hasAddCosigner} = this
        if (this.currentMinApproval == 0) {
            return
        }
        if (this.currentMinApproval > 1 || hasAddCosigner) {
            this.createBondedModifyTransaction()
            return
        }
        this.createCompleteModifyTransaction()
        this.showCheckPWDialog = true
    }


    createCompleteModifyTransaction() {
        let {multisigPublickey, cosignerList, innerFee, minApprovalDelta, minRemovalDelta} = this.formItem
        const {networkType, xemDivisibility} = this
        const multisigCosignatoryModificationList = cosignerList
            .map(cosigner => new MultisigCosignatoryModification(
                cosigner.type,
                PublicAccount.createFromPublicKey(cosigner.publickey, networkType),
            ))
        innerFee = getAbsoluteMosaicAmount(innerFee, xemDivisibility)
        const modifyMultisigAccountTx = MultisigAccountModificationTransaction.create(
            Deadline.create(),
            Number(minApprovalDelta),
            Number(minRemovalDelta),
            multisigCosignatoryModificationList,
            networkType,
            UInt64.fromUint(innerFee)
        )
        const aggregateTransaction = createCompleteMultisigTransaction(
            [modifyMultisigAccountTx],
            multisigPublicKey,
            networkType,
            innerFee,
        )
        this.transactionList = [aggregateTransaction]
    }

    createBondedModifyTransaction() {
        let {cosignerList, bondedFee, innerFee, minApprovalDelta, minRemovalDelta} = this.formItem
        const {networkType, node, publicKey,xemDivisibility} = this
        innerFee = getAbsoluteMosaicAmount(innerFee, xemDivisibility)
        bondedFee = getAbsoluteMosaicAmount(bondedFee, xemDivisibility)
        const multisigCosignatoryModificationList = cosignerList
            .map(cosigner => new MultisigCosignatoryModification(
                cosigner.type,
                PublicAccount.createFromPublicKey(cosigner.publickey, networkType),
            ))
        const modifyMultisigAccountTransaction = MultisigAccountModificationTransaction.create(
            Deadline.create(),
            Number(minApprovalDelta),
            Number(minRemovalDelta),
            multisigCosignatoryModificationList,
            networkType,
            UInt64.fromUint(innerFee)
        )
        const aggregateTransaction = createBondedMultisigTransaction(
            [modifyMultisigAccountTransaction],
            publicKey,
            networkType,
            bondedFee
        )
        this.transactionList = [aggregateTransaction]
    }

    checkEnd(isPasswordRight) {
        if (!isPasswordRight) {
            this.$Notice.destroy()
            this.$Notice.error({
                title: this.$t(Message.WRONG_PASSWORD_ERROR) + ''
            })
        }
    }


    showErrorMessage(message: string) {
        this.$Notice.destroy()
        this.$Notice.error({
            title: message
        })
    }

    checkForm(): boolean {
        const {multisigPublicKey, cosignerList, minApprovalDelta, minRemovalDelta} = this.formItems
        const {currentMinApproval, currentMinRemoval} = this

        if ((!Number(minRemovalDelta) && Number(minRemovalDelta) !== 0) || Number(minRemovalDelta) + currentMinRemoval < 1) {
            this.showErrorMessage(this.$t(Message.MIN_REMOVAL_LESS_THAN_0_ERROR) + '')
            return false
        }

        if ((!Number(minApprovalDelta) && Number(minApprovalDelta) !== 0) || Number(minApprovalDelta) + currentMinApproval < 1) {
            this.showErrorMessage(this.$t(Message.MIN_APPROVAL_LESS_THAN_0_ERROR) + '')
            return false
        }

        if (Number(minApprovalDelta) + currentMinApproval > 10) {
            this.showErrorMessage(this.$t(Message.MAX_APPROVAL_MORE_THAN_10_ERROR) + '')
            return false
        }

        if (Number(minRemovalDelta) + currentMinRemoval > 10) {
            this.showErrorMessage(this.$t(Message.MAX_REMOVAL_MORE_THAN_10_ERROR) + '')
            return false
        }

        if (multisigPublicKey.length !== 64) {
            this.$Notice.error({title: this.$t(Message.ILLEGAL_PUBLIC_KEY_ERROR) + ''})
            return false
        }

        if (cosignerList.length < 1) {
            return true
        }
        const publickeyFlag = cosignerList.every((item) => {
            if (item.type == CosignatoryModificationAction.Add) {
                this.hasAddCosigner = true
            }

            if (item.publicKey.trim().length !== 64) {
                this.$Notice.error({title: this.$t(Message.ILLEGAL_PUBLIC_KEY_ERROR) + ''})
                return false
            }
            return true
        })
        return publicKeyFlag
    }

    @Watch('formItems.multisigPublicKey')
    @Watch('formItems.multisigPublicKey')
    onMultisigPublicKeyChange(newPublicKey, oldPublicKey) {
        if (!newPublicKey || newPublicKey === oldPublicKey) return
        this.$store.commit('SET_ACTIVE_MULTISIG_ACCOUNT', newPublicKey)
    }

    @Watch('formItems', {immediate: true, deep: true})
    onFormItemChange() {
        const {multisigPublicKey, cosignerList, minApprovalDelta, minRemovalDelta} = this.formItems
        const {feeAmount} = this
        // isCompleteForm
        this.isCompleteForm = multisigPublicKey.length === 64 && cosignerList.length !== 0 && feeAmount + '' !== '' && minApprovalDelta + '' !== '' && minRemovalDelta + '' !== ''
    }
}
