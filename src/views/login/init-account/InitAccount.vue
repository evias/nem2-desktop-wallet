<template>
  <div class="init_account radius">
    <div class="methodDiv">

      <div class="createDiv">
        <div class="createIcon">
          <img src="@/common/img/login/guide-into/guideIntoCreate.png">
        </div>
        <p class="createTit">{{$t('create_now')}}</p>
        <p class="createTxt">{{$t('this_will_create_a_new_torrent_file')}}</p>
        <div class="button pointer" @click="createNewMnemonic()">
          {{$t('create_wallet')}}
          <div/>
        </div>
      </div>

      <div class="importDiv">
        <div class="importIcon">
          <img src="@/common/img/login/guide-into/guideIntoImport.png">
        </div>
        <p class="importTit">{{$t('existing_wallet')}}</p>
        <p class="importTxt">{{$t('import_text_only_mnemonic')}}</p>
        <div class="button pointer" @click="jumpToOtherPage(1)">{{$t('import_wallet')}}</div>
      </div>

      <div v-if="$store.state.app._ENABLE_TREZOR_" class="importTrezor">
        <div class="importIcon">
          <img src="@/common/img/login/guide-into/guideIntoImport.png">
        </div>
        <p class="importTit">{{$t('connect_trezor_prompt')}}</p>
        <p class="importTxt">{{$t('connect_trezor_description')}}</p>
        <div class="button pointer" @click="jumpToOtherPage(2)">{{$t('import_wallet')}}</div>
      </div>
      <div v-else class="importHardware">
        <div class="importIcon">
          <img src="@/common/img/login/guide-into/guideIntoImport.png">
        </div>
        <p class="importTit">{{$t('WLT_file')}}</p>
        <p class="importTxt">{{$t('Import_a_seed_file_from_a_WLT_file_or_hardware_wallet')}}</p>
        <div class="button disabled un_click" @click="">{{$t('import_wallet')}}</div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
    //@ts-ignore
    import {InitAccountTs} from '@/views/login/init-account/InitAccountTs.ts'
    import "./InitAccount.less"

    export default class InitAccount extends InitAccountTs {

    }
</script>

<style scoped lang="less">
</style>
