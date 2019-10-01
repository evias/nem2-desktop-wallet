<template>
  <div class="transaction_content secondary_page_animate">
    <div class="left_container radius ">
      <div class="bottom_transfer_info scroll ">
        <div class="multisig">
          <TransferForm></TransferForm>
        </div>
      </div>
    </div>
    <CollectionRecord :filterType="transactionType.Transfer" :filterOrigin="transferType.SENT" />
  </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {MonitorFormTransferTs} from '@/views/monitor/monitor-form-transfer/MonitorFormTransferTs.ts'

    export default class MonitorFormTransfer extends MonitorFormTransferTs {

    }
</script>
<style scoped lang="less">
  @import "MonitorFormTransfer.less";
</style>
