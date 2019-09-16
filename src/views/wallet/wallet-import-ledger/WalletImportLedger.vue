<template>
  <div>
    <div class="ledger">
      <div class="describle">
        {{$t('the_private_key_is_a_string_of_256_bit_random_strings_which_is_the_absolute_control_of_the_account_Please_keep_it_safe')}}
      </div>
      <ul>
        <li>
          {{$t('choose_network')}}
          <div class="gray_content">
            <Select v-model="form.networkType" :placeholder="$t('choose_network')">
              <Option v-for="item in NetworkTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </div>
        </li>
        <li>
          {{$t('set_the_wallet_name')}}
          <div class="gray_content">
            <input class="absolute" type="text" v-model="form.walletName"
                   :placeholder="$t('set_the_wallet_name')">
          </div>
        </li>

      </ul>


    </div>
    <div class="bottom_button ">
      <span class="back left" @click="toBack"> {{$t('back')}}</span>
      <span class="import right" @click="importWallet">{{$t('import')}}</span>
    </div>
  </div>
</template>

<script lang="ts">
    //@ts-ignore
    import {WalletImportLedgerTs} from '@/views/wallet/wallet-import-ledger/WalletImportLedgerTs'

    export default class WalletImportLedger extends WalletImportLedgerTs {

    }
</script>
<style scoped lang="less">
  @import "WalletImportLedger.less";
</style>
