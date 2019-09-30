<template>
  <div class="right_record radius">
    <TransactionModal
      :visible="showDialog"
      :activeTransaction="activeTransaction"
      @close="showDialog = false"
    /> 

    <div class="top_title">
      <span>{{filterOrigin === transferType.RECEIVED
          ? $t('transfer_received') : $t('transfer_sent')}}</span>
    </div>

    <div :class="['bottom_transfer_record_list','scroll']">
      <Spin v-if="transactionsLoading" size="large" fix />

      <div
              v-for="(c, index) in pagedTransactionList"
              :key="`${index}cf`"
              class="transaction_record_item pointer"
              @click="showDialog = true; activeTransaction = c"
      >
        <img v-if="c.isTxUnconfirmed" src="@/common/img/monitor/transaction/txUnConfirmed.png" alt="">
        <img v-if="!c.isTxUnconfirmed" src="@/common/img/monitor/transaction/txConfirmed.png" alt="">
        <div class="flex_content">
          <div class="left left_components">
            <div class="top overflow_ellipsis">{{ renderMosaicNames(c.rawTx.mosaics, mosaicList, currentXem) }}</div>
            <div class="bottom overflow_ellipsis"> {{c.txHeader.time.slice(0, c.txHeader.time.length - 3)}}</div>
          </div>
          <div class="right">
            <div class="top overflow_ellipsis">{{ renderMosaicAmount(c.rawTx.mosaics, mosaicList) }}</div>
            <div class="bottom overflow_ellipsis">
              {{formatNumber(c.txHeader.block)}}
            </div>
          </div>
        </div>
      </div>

      <div class="no_data" v-if="pagedTransactionList.length == 0 && !transactionsLoading">
        {{$t('no_confirmed_transactions')}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import {CollectionRecordTs} from '@/common/vue/collection-record/CollectionRecordTs.ts'
    export default class CollectionRecord extends CollectionRecordTs {
    }
</script>
<style scoped lang="less">
  @import "CollectionRecord.less";
</style>
