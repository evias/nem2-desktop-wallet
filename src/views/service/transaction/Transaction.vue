<template>
  <div class="transaction_container">
    <div class="top_navigator radius">
      <span
              v-for="(b,index) in buttonList"
              :key="index"
              class="button_list_item "
      >
        <span :class="['name',b.isSelected?'active':'','pointer']" @click="switchButton(index)">{{$t(b.name)}}</span>
        <span class="line" v-if="index !== (buttonList.length -1) ">|</span>
      </span>
    </div>

    <div class="sub_function_container scroll radius">
      <TransactionList v-if="buttonList[0].isSelected"/>
      <TransferPage v-if="buttonList[1].isSelected"/>
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
