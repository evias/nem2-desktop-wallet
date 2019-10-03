<template v-slot:fields>

  <div class="field-flex">
    <ValidationProvider rules="required|addressOrPublicKeyOrNamespace">
      <RecipientSelect v-model="recipient" />
    </ValidationProvider>
  </div>

  <div class="field-flex">
    <ValidationProvider rules="required">
      <MosaicAmountSelect v-model="mosaics" />
    </ValidationProvider>
  </div>

  <div class="field-flex">
    <label class="field-label">{{$t('remarks')}}</label>
    <ValidationProvider rules="required">
      <textarea class="no-scroll" 
                v-model="message"
                :placeholder="$t('please_enter_a_comment')"></textarea>
    </ValidationProvider>
  </div>

</template>

<script lang="ts">
    import {TransferFormTs} from '@/views/service/transaction/forms/TransferFormTs.ts'

    export default class TransferForm extends TransferFormTs {

    }

</script>
<style scoped lang="less">
  @import "@/components/FormComponent.less";
  @import "TransferForm.less";
</style>
