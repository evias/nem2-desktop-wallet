<template>
  <div class="checkPWDialogWrap">
    <Modal
            v-model="show"
            class-name="vertical-center-modal"
            :footer-hide="true"
            :transfer="false"
            @on-cancel="updateDialogCancel">
      <div slot="header" class="checkPWDialogHeader">
        <span class="title">{{$t('update_wallet_name')}} : {{walletToUpdate.name}}</span>
      </div>
      <div class="checkPWDialogBody">
        <div class="stepItem1">
          <Form :model="wallet">
            <FormItem>
              <Input v-model="wallet.name" required
                     :placeholder="$t('please_enter_your_new_wallet_name')"></Input>
            </FormItem>
            <FormItem>
              <Button type="success" @click="submit"> {{$t('confirm')}}</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    </Modal>
  </div>
</template>


<script lang="ts">
    import "./TheWalletUpdate.less"
    import {TheWalletUpdateTs} from '@/views/wallet/wallet-switch/the-wallet-update/TheWalletUpdateTs.ts'

    /**
     @Prop: showCheckPWDialog
     @return: closeCheckPWDialog()
     @return: checkEnd(privatekey:string)
     */

    export default class TheWalletUpdate extends TheWalletUpdateTs {
    }
</script>

<style scoped>
</style>
