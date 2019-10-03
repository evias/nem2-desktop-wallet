<template v-slot:fields>


  <div class="field-flex">
    <ValidationProvider rules="required|addressOrNamespace">
      <SignerAccountSelect v-model="signerPublicKey" />
    </ValidationProvider>
  </div>
  
  <div class="field-flex">
    <label class="field-label">{{$t('field_label_signer')}}</label>
    <span class="field-value-wrapper no-border"
            v-if="!formModel.payload.length">
      {{ activeAccount.wallet.address }}
    </span>
    <span class="field-value-wrapper no-border"
            v-if="formModel.payload.length > 0">
      {{ readSignerAddress(this.transactionList[0]) }}
    </span>
  </div>

  <div class="field-flex">
    <label class="field-label">{{$t('remarks')}}</label>
    <span class="field-value-wrapper radius">
      <ValidationProvider rules="required|payload" v-slot="{ errors }">
        <FormInput fieldName="payload" :formModel="payload"/>
        <span>{{ errors[0] }}</span>
      </ValidationProvider>
    </span>
  </div>

</template>

<script lang="ts">
    import {TransactionURIFormTs} from '@/views/service/transaction/forms/TransactionURIFormTs.ts'

    export default class TransactionURIForm extends TransactionURIFormTs {

    }

</script>
<style scoped lang="less">
  @import "@/components/FormComponent.less";
</style>
