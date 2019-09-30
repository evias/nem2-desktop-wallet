<template>
  <div class="transaction_container">
    <div class="top_navigator radius">
      <span
                :class="[n.isSelected?'active_navigator':'','outter_container','pointer']"
                @click="switchPanel(index)"
                v-for="(n,index) in navigatorList"
                :key="index"
        >
        <span class="inner_container absolute">{{$t(n.name)}}</span>
        <span class="line">|</span>
      </span>
    </div>

    <div class="bottom_router_view">
      <router-view/>
    </div>

  </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {TransactionTs} from '@/views/service/transaction/TransactionTs.ts'

    export default class Transaction extends TransactionTs {

    }


</script>

<style scoped lang="less">
  @import "Transaction.less";
</style>
