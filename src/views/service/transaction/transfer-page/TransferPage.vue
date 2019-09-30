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
    <CollectionRecord :filterType="transactionType.Transfer" :filterOrigin="transferType.RECEIVED" />
  </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {TransferPageTs} from '@/views/service/transaction/transfer-page/TransferPageTs.ts'


    export default class TransferPage extends TransferPageTs {

    }
</script>
<style scoped lang="less">
  @import "TransferPage.less";
</style>
