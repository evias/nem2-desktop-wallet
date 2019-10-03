<template>
  <div class="accountUnlockDialogWrap">

    <Modal v-model="showDialog"
           class-name="vertical-center-modal"
           :footer-hide="true"
           :transfer="false"
           @on-cancel="closeDialog">
      <form>
        <input v-model="formModel.password" type="password" required
                :placeholder="$t('please_enter_your_wallet_password')"/>
        <Button type="success" @click="validatePassword">{{$t('confirm')}}</Button>
      </form>
    </Modal>

  </div>
</template>


<script lang="ts">
    import "./AccountUnlockDialog.less"
    import {AccountUnlockDialogTs} from '@/components/account-unlock-dialog/AccountUnlockDialogTs.ts'

    export default class AccountUnlockDialog extends AccountUnlockDialogTs {
    }
</script>

<style scoped>
</style>
