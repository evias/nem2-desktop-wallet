<template>
  <div class="transaction_content secondary_page_animate" @click="hideSearchDetail()">
    <div class="left_container radius ">
      <div class="bottom_transfer_info scroll ">
        <div class="multisig">
          <TransferForm></TransferForm>
        </div>
      </div>
    </div>
    <CollectionRecord :transactionType="transferType.SENT" />
  </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {TransferPageTs} from '@/views/service/transaction/transfer-page/TransferPageTs.ts'


    export default class MonitorFormTransfer extends TransferPageTs {

    }
</script>
<style scoped lang="less">
  @import "../../service/transaction/transfer-page/TransferPage.less";
</style>
