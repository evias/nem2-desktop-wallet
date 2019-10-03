<template>
  <div class="field-flex">
    <label class="field-label">{{$t('account')}}</label>
    <span v-if="! hasMultisigAccounts"
          class="field-value-wrapper">
      {{ formatAddress(signerPublicKey) }}
    </span>

    <div class="field-value-wrapper" 
          v-if="hasMultisigAccounts">
      <Select v-model="signerPublicKey"
              @change="onChange()"
              :placeholder="$t('publicKey')">
        <Option v-for="item in multisigPublicKeyList"
                :value="item.publicKey" 
                :key="item.publicKey">
          {{ item.address }}
        </Option>
      </Select>
    </div>
  </div>
</template>

<script lang="ts">
    import {SignerAccountSelectTs} from '@/components/signer-account-select/SignerAccountSelectTs.ts'

    export default class SignerAccountSelect extends SignerAccountSelectTs {
    }
</script>

<style scoped>
    @import "./SignerAccountSelect.less";
</style>
