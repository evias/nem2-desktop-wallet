<template>
  <ValidationObserver ref="observer">
    <b-form slot-scope="{ validate }" 
            @submit.prevent="validate().then(onSubmit)"
            @reset="resetForm">

      <slot name="fields"></slot>

      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset" variant="danger">Reset</b-button>

    </b-form>
  </ValidationObserver>
</template>


<script lang="ts">
    import "./AccountUnlockDialog.less"
    import {AccountUnlockDialogTs} from '@/components/account-unlock-dialog/AccountUnlockDialogTs.ts'

    export default class AccountUnlockDialog extends AccountUnlockDialogTs {
    }
</script>

<style scoped>
</style>
