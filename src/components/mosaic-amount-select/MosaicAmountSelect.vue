<template>
  <div class="field-flex">
    <label class="field-label">{{$t('asset_type')}}</label>
    <div class="field-value-wrapper radius">
      <ErrorTooltip fieldName="mosaic" placementOverride="left">
        <Select
              data-vv-name="mosaic"
              v-model="currentMosaicId"
              v-validate="'required'"
              :data-vv-as="$t('asset_type')"
              :placeholder="$t('asset_type')"
              class="asset_type">
          <Option v-for="item in mosaicsOwned" 
                  :value="item.mosaicInfo.id"
                  :key="item.mosaicInfo.id">
            {{ getMosaicName(item) }}
          </Option>
        </Select>
      </ErrorTooltip>
      <ErrorTooltip fieldName="amount">
        <input number type="text"
               v-model="relativeAmount"
               placeholder="$t('please_enter_the_transfer_amount')" />
      </ErrorTooltip>
    </div>
    <span class="add_mosaic_button radius" @click="addMosaic"></span>
  </div>

  <span class="overflow_ellipsis">{{$t('mosaic')}}</span>
  <span class="overflow_ellipsis">{{$t('amount')}}</span>

  <div class="field-flex scroll-wrapper">
    <div class="field-value-wrapper" v-if="mosaicsAdded.length > 0">
      <div class="mosaic_list_item radius" v-for="(idHex, mosaicAmountView) in mosaicsAdded">
        <span class="overflow_ellipsis">{{getMosaicName(mosaicAmountView)}}</span>
        <span class="overflow_ellipsis">{{toRelativeAmount(mosaicAmountView)}}</span>
        <span class="icon-delete" @click="removeMosaic(mosaic)"></span>
      </div>
    </div>
    <div class="no_data" v-if="!mosaicsAdded.length">
      {{$t('no_data')}}
    </div>
  </div>

</template>

<script lang="ts">
    import {MosaicAmountSelectTs} from '@/components/mosaic-amount-select/MosaicAmountSelectTs.ts'

    export default class MosaicAmountSelect extends MosaicAmountSelectTs {
    }
</script>

<style scoped>
  @import "@/components/FormComponent.less";
</style>
