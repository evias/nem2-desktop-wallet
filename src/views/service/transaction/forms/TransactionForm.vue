<template>
  <div class="form-component-wrapper">
    <form @submit.prevent="canSubmit()">
      <ValidationObserver v-slot="{ valid }" ref="transaction">

        <ValidationProvider rules="required|publicKey">
          <SignerAccountSelect v-model="signerPublicKey" />
        </ValidationProvider>

        <slot name="fields"></slot>

        <ValidationProvider rules="required">
          <TransactionFeeSelect v-model="fee" 
                                :feeMultiplier="feeMultiplier" />
        </ValidationProvider>

      </ValidationObserver>
    </form>

    <AccountUnlockDialog :showDialog="mustUnlockAccount" />
    <TransactionSigner v-if="canSignTransactions"
                       :generationHash="this.activeAccount.generationHash"
                       :signerAccount="signerAccount"
                       :transactionList="transactionList"
                       />
    <TransactionBroadcaster v-if="canBroadcastTransactions"
                            :signedTransactions="signedTransactions" />

  </div>
</template>

<script lang="ts">
    import {TransactionFormTs} from '@/views/service/transaction/forms/TransactionFormTs.ts'

    export default class TransactionForm extends TransactionFormTs {

    }

</script>
<style scoped lang="less">
  @import "TransactionForm.less";
</style>
