<template>
  <div class="checkPWDialogWrap">
    <Modal
            v-model="show"
            class-name="vertical-center-modal"
            :footer-hide="true"
            :transfer="false"
            @on-cancel="checkPasswordDialogCancel">
      <div slot="header" class="checkPWDialogHeader">
        <span class="title">{{$t('confirm_information')}}</span>
      </div>
      <div class="checkPWDialogBody">
        <div class="stepItem1">
          <div v-if="isOnlyCheckPassword">
            <div class="checkPWImg">
              <img src="@/common/img/window/checkPW.png">
            </div>
            <p class="checkRemind">
              {{$t('please_enter_your_wallet_password_to_ensure_your_own_operation_and_keep_your_wallet_safe')}}</p>
          </div>


          <div class="info_container" v-else>
            <div
                    v-for="(value,key,index) in transactionDetail"
                    :key="`ic${index}`"
                    class="info_container_item">
              <span class="key">{{$t(key)}}</span>
              <span v-if="key == 'transaction_type'" class="value orange">{{$t(value)}}</span>
              <span v-else class="value overflow_ellipsis">{{value}}</span>
            </div>
          </div>


          <form>
            <input v-model="walletInputInfo.password" type="password" required
                   :placeholder="$t('please_enter_your_wallet_password')"/>
            <Button type="success" @click="checkPassword">{{$t('confirm')}}</Button>
          </form>
        </div>
      </div>
    </Modal>

  </div>
</template>


<script lang="ts">
    import "./CheckPasswordDialog.less"
    import {CheckPasswordDialogTs} from '@/common/vue/check-password-dialog/CheckPasswordDialogTs.ts'

    export default class CheckPasswordDialog extends CheckPasswordDialogTs {
    }
</script>

<style scoped>
</style>
