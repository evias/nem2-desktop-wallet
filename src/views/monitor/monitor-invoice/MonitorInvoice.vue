<template>
  <div class="qr_content secondary_page_animate">
    <Spin v-if="false" size="large" fix class="absolute"></Spin>
    <div class="left_container radius">
      <img id="qrImg" :src="QRCode" alt="">
      <div class="qr_info">
        <div class="amount">{{qrInfo.mosaicHex}} : {{qrInfo.mosaicAmount}}</div>
        <div class="address_text" id="address_text">
          {{accountAddress}}
        </div>
        <div class="notes">
          {{qrInfo.remarks}}
        </div>
        <div class="qr_button ">
          <span class="radius pointer" @click="copyAddress">{{$t('copy_address')}}</span>
          <span class="radius pointer" @click="downloadQR">{{$t('copy_QR_code')}}</span>
        </div>
      </div>

    </div>
    <CollectionRecord :transactionType="TransferType.RECEIVED"></CollectionRecord>

    <div class="modal scroll">
      <div class="modal_title">{{$t('set_amount')}}</div>
      <div class="asset flex_center">
        <span class="title">{{$t('asset_type')}}</span>
        <span class="value radius flex_center">

          <AutoComplete
                  v-model="formItem.mosaicHex"
                  :filter-method="filterMethod"
                  :placeholder="$t('Please_enter_mosaic_hex_or_alias')"
                  class="asset_type"
          >
            <Option v-for="m in mosaicList" :value="m.value" :key="m.value">
                <span>{{ m.label }}</span>
            </Option>
    </AutoComplete>

        </span>
        <span class="value radius flex_center">
          <input class="amount_input" type="text" @change="onChange" v-model="formItem.mosaicAmount"
                 :placeholder="$t('Please_enter_the_amount_of_transfer')">
        </span>
      </div>
      <div class="remark flex_center">
        <span class="title">{{$t('remarks')}}</span>
        <span class=" textarea_container flex_center value radius ">
          <textarea v-model="formItem.remarks" :placeholder="$t('Please_enter_notes')" refs="textarea"
                    @keyup="checkLength"></textarea>
        </span>
        <span class="remark_length">{{formItem.remarks.length}}/25</span>
      </div>
      <div @click="generateQR()" class="send_button pointer">
        {{$t('generate_QR_code')}}
      </div>
    </div>

  </div>
</template>

<script lang="ts">
    import "./MonitorInvoice.less"

    import {MonitorInvoiceTs} from '@/views/monitor/monitor-invoice/MonitorInvoiceTs.ts'

    export default class MonitorInvoice extends MonitorInvoiceTs {

    }
</script>
<style scoped lang="less">

</style>
