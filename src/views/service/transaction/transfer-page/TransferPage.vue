<template>
  <div class="transaction_content secondary_page_animate">
    <div class="left_container radius ">
      <div class="bottom_transfer_info scroll ">
        <div class="multisig">
          <TransferForm></TransferForm>
        </div>
      </div>
    </div>

    <PageTutorial :pageTitle="'tutorial_transfer_page_title'"
                  :titles="['tutorial_transfer_title_1', 'tutorial_transfer_title_2']"
                  :explanations="['tutorial_transfer_explanation_1', 'tutorial_transfer_explanation_2']"
                  />

    <CollectionRecord :filterType="transactionType.Transfer" :filterOrigin="transferType.SENT" />
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
