<template>
  <div class="mosaic_transaction_container radius secondary_page_animate">
    <div class="left_switch_type">
      <div class="type_list_item " v-for="(b,index) in typeList">
        <span :class="['name',b.isSelected?'active':'','pointer']" @click="switchType(index)">{{$t(b.name)}}</span>
      </div>
    </div>

    <div class="right_panel">
      <div class="namespace_transaction">
        <div class="form_item">
          <span class="key">{{$t('account')}}</span>
          <span class="value" v-if="typeList[0].isSelected && wallet">{{formatAddress(wallet.address)}}</span>
          <Select v-if="typeList[1].isSelected" :placeholder="$t('publickey')" v-model="formItem.multisigPublickey"
                  class="select">
            <Option v-for="item in multisigPublickeyList" :value="item.value" :key="item.value">{{ item.label }}
            </Option>
          </Select>
        </div>


        <div class="form_item">
          <span class="key">{{$t('supply')}}</span>
          <span class="value">
            <input v-model="formItem.supply" type="text" :placeholder="$t('supply')">
            <span class="number_controller">
                <img @click="addSupplyAmount " class="pointer"
                     src="@/common/img/monitor/market/marketAmountUpdateArrow.png"/>
                <img @click="cutSupplyAmount" class="pointer"
                     src="@/common/img/monitor/market/marketAmountUpdateArrow.png"/>
            </span>
           </span>
        </div>

        <div class="form_item">
          <span class="key">{{$t('mosaic_divisibility')}}</span>
          <span class="value">
            <input v-model="formItem.divisibility" type="text" :placeholder="$t('mosaic_divisibility')">
            <span class="number_controller">
              <img @click="addSeverabilityAmount " class="pointer"
                   src="@/common/img/monitor/market/marketAmountUpdateArrow.png"/>
              <img @click="cutSeverabilityAmount" class="pointer"
                   src="@/common/img/monitor/market/marketAmountUpdateArrow.png"/>
            </span>
           </span>
        </div>


        <div class="check_box">
          <Checkbox class="check_box_item" v-model="formItem.transferable">{{$t('transmittable')}}</Checkbox>
          <Checkbox class="check_box_item" v-model="formItem.supplyMutable">{{$t('variable_supply')}}</Checkbox>
          <Checkbox class="check_box_item" v-model="formItem.permanent">{{$t('duration_permanent')}}</Checkbox>
          <Checkbox class="check_box_item" v-model="formItem.restrictable">{{$t('restrictable')}}</Checkbox>
        </div>


        <div class="form_item duration_item" v-if="!formItem.permanent">
          <span class="key">{{$t('duration')}}</span>
          <span class="value">
             <input v-model="formItem.duration" @input="durationChange" type="text" :placeholder="$t('duration')">
            <span class="end_label">{{$t('duration')}}:{{durationIntoDate}}</span>
         </span>
          <div class="tips">
            {{$t('namespace_duration_tip_1')}}
          </div>
        </div>

        <div class="form_item XEM_rent_fee" v-if="false">
          <span class="key">{{$t('rent')}}</span>
          <span class="value">{{Number(formItem.duration)}}XEM</span>
        </div>

        <div class="form_item" v-if="typeList[0].isSelected">
          <span class="key">{{$t('fee')}}</span>
          <span class="value">
              <input type="text" v-model="formItem.innerFee" :placeholder="$t('fee')">
            <!--            <span class="end_label">gas</span>-->
          </span>
          <div class="tips">
            {{$t('the_more_you_set_the_cost_the_higher_the_processing_priority')}}
          </div>
        </div>
        <div v-else>
          <div class="form_item">
            <span class="key">{{$t('inner_fee')}}</span>
            <span class="value">
              <input type="text" v-model="formItem.innerFee" :placeholder="$t('inner_fee')">
              <!--            <span class="end_label">gas</span>-->
          </span>
            <div class="tips">
              {{$t('the_more_you_set_the_cost_the_higher_the_processing_priority')}}
            </div>
          </div>

          <div class="form_item">
            <span class="key">{{$t('bonded_fee')}}</span>
            <span class="value">
              <input type="text" v-model="formItem.aggregateFee" :placeholder="$t('bonded_fee')">
              <!--            <span class="end_label">gas</span>-->
          </span>
            <div class="tips">
              {{$t('the_more_you_set_the_cost_the_higher_the_processing_priority')}}
            </div>
          </div>
          <div class="form_item">
            <span class="key">{{$t('lock_fee')}}</span>
            <span class="value">
              <input type="text" v-model="formItem.lockFee" :placeholder="$t('lock_fee')">
              <!--            <span class="end_label">gas</span>-->
          </span>
            <div class="tips">
              {{$t('the_more_you_set_the_cost_the_higher_the_processing_priority')}}
            </div>
          </div>
        </div>

        <div :class="['create_button' ,isCompleteForm?'pointer':'not_allowed']"
             @click="createMosaic(typeList[1].isSelected)">
          {{$t('create')}}
        </div>
      </div>
    </div>
    <CheckPWDialog
            :showCheckPWDialog="showCheckPWDialog"
            @closeCheckPWDialog="closeCheckPWDialog"
            @checkEnd="checkEnd"
            :transactionDetail="transactionDetail"
            :transactionList=transactionList
            :otherDetails="otherDetails"
    ></CheckPWDialog>
  </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {MosaicTransactionTs} from '@/views/service/mosaic/mosaic-function/mosaic-transaction/MosaicTransactionTs.ts'

    export default class MosaicTransaction extends MosaicTransactionTs {

    }
</script>
<style scoped lang="less">
  @import "MosaicTransaction.less";
</style>
