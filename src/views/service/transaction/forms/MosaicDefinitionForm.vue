<template v-slot:fields>

  <div class="field-flex">
    <label class="field-label">{{$t('supply')}}</label>
    <span class="field-value-wrapper radius">
      <ValidationProvider rules="required|supply">
        <FormInput fieldName="supply" :formModel="supply"/>
        <span class="number_controller">
          <img @click="supply = supply + 1" class="pointer"
                src="@/common/img/monitor/market/marketAmountUpdateArrow.png"/>
          <img @click="supply = supply - 1" class="pointer"
                src="@/common/img/monitor/market/marketAmountUpdateArrow.png"/>
        </span>
      </ValidationProvider>
    </span>
  </div>

  <div class="field-flex">
    <label class="field-label">{{$t('mosaic_divisibility')}}</label>
    <span class="field-value-wrapper radius">
      <ValidationProvider rules="required|divisibility">
        <FormInput fieldName="divisibility" :formModel="divisibility"/>
        <span class="number_controller">
          <img @click="divisibility = divisibility + 1" class="pointer"
                src="@/common/img/monitor/market/marketAmountUpdateArrow.png"/>
          <img @click="divisibility = divisibility - 1" class="pointer"
                src="@/common/img/monitor/market/marketAmountUpdateArrow.png"/>
        </span>
      </ValidationProvider>
    </span>
  </div>

  <div class="field-flex">
    <Checkbox v-model="transferable">{{$t('transmittable')}}</Checkbox>
    <Checkbox v-model="supplyMutable">{{$t('variable_supply')}}</Checkbox>
    <Checkbox v-model="permanent">{{$t('duration_permanent')}}</Checkbox>
    <Checkbox v-model="restrictable">{{$t('restrictable')}}</Checkbox>
  </div>

  <div class="field-flex" v-if="!permanent">
    <label class="field-label">{{$t('mosaic_divisibility')}}</label>
    <span class="field-value-wrapper radius">
      <ValidationProvider rules="required|min:1">
        <FormInput fieldName="duration" :formModel="duration" :placeholder="$t('duration')"/>
        <span class="end_label">{{$t('duration')}}:{{durationIntoDate}}</span>
      </ValidationProvider>
    </span>
    <div class="field-tooltip">
      {{$t('namespace_duration_tip_1')}}
    </div>
  </div>

</template>

<script lang="ts">
    // @ts-ignore
    import {MosaicDefinitionFormTs} from '@/views/service/transaction/forms/MosaicDefinitionFormTs.ts'

    export default class MosaicDefinitionForm extends MosaicDefinitionFormTs {

    }
</script>
<style scoped lang="less">
  @import "@/components/FormComponent.less";
  @import "MosaicDefinitionForm.less";
</style>
