<template>
  <div class="field-flex">
    <label class="field-label">{{$t('transfer_target')}}</label>
    <div class="field-value-wrapper radius">
      <FormInput fieldName="recipient" 
                 :formModel="recipient" 
                 :placeholder="$t('receive_address_or_alias')"/>
    </div>
    <span class="action-button" @click.stop="resolveInput">@</span>
  </div>
</template>

<script lang="ts">
    import {RecipientSelectTs} from '@/components/recipient-select/RecipientSelectTs.ts'

    export default class RecipientSelect extends RecipientSelectTs {
    }
</script>

<style scoped>
  @import "@/components/FormComponent.less";
</style>
