<template>
  <div class="field-flex">
    <label class="field-label">{{$t('fee')}}</label>
    <div class="field-value-wrapper radius">
      <Select v-model="fee"
              v-validate="'required'"
              :data-vv-as="$t('fee')"
              :placeholder="$t('fee')"
      >
        <Option v-for="item in feeGroups" 
                :value="item.amount">
          {{$t(item.speed)}} {{ `(${item.amount} nem.xem)` }}
        </Option>
      </Select>
    </div>
    <span class="field-tooltip">{{$t('the_more_you_set_the_cost_the_higher_the_processing_priority')}}</span>
  </div>
</template>

<script lang="ts">
    import {TransactionFeeSelectTs} from '@/components/recipient-select/TransactionFeeSelectTs.ts'

    export default class TransactionFeeSelect extends TransactionFeeSelectTs {
    }
</script>

<style scoped>
    @import "../FormComponent.less";
</style>