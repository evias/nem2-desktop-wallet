<template>
  <div class="transaction_content secondary_page_animate">
    <div class="left_container radius ">
      <div class="bottom_transfer_info scroll ">
        <div class="multisig">
          <TransactionURIForm></TransactionURIForm>
        </div>
      </div>
    </div>

    <PageTutorial :pageTitle="'tutorial_uri_title'"
                  :titles="['tutorial_uri_title_1', 'tutorial_uri_title_2']"
                  :explanations="['tutorial_uri_explanation_1', 'tutorial_uri_explanation_2']"
                  />

    <CollectionRecord :filterType="transactionType.Transfer" :filterOrigin="transferType.RECEIVED" />
  </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {TransactionURIPageTs} from '@/views/service/transaction/pages/TransactionURIPageTs.ts'


    export default class TransactionURIPage extends TransactionURIPageTs {

    }
</script>
<style scoped lang="less">
  @import "TransactionURIPage.less";
</style>
