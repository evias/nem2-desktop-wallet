<template>
  <div class="mosaicUnAliasDialogWrap">
    <Modal
            v-model="show"
            class-name="vertical-center-modal"
            :footer-hide="true"
            :width="1000"
            :transfer="false"
            @on-cancel="mosaicAliasDialogCancel">
      <div slot="header" class="mosaicAliasDialogHeader">
        <span class="title">{{$t('unbind')}}</span>
      </div>
      <div class="mosaicAliasDialogBody">
        <div class="stepItem1">
          <Form :model="formItem">
            <FormItem :label="$t('mosaic_ID')">
              <p class="mosaicTxt">{{unAliasItem.aliasTarget}}</p>
            </FormItem>
            <FormItem :label="$t('unbind_alias')">
              <p class="mosaicTxt">{{unAliasItem.label}}</p>
            </FormItem>
            <FormItem :label="$t('fee')">
              <Input v-model="formItem.fee" number required placeholder=""></Input>
              <div class="tips">
                {{$t('the_more_you_set_the_cost_the_higher_the_processing_priority')}}
              </div>
            </FormItem>
            <FormItem :label="$t('password')">
              <Input v-model="formItem.password" type="password" required
                     :placeholder="$t('please_enter_your_wallet_password')"></Input>
            </FormItem>
            <FormItem class="button_update">
              <Button type="success" @click="submit">{{$t('unbind')}}</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
    import './NamespaceUnAliasDialog.less'
    import {NamespaceUnAliasDialogTs} from '@/views/service/namespace/namespace-function/namespace-list/namespace-unAlias-dialog/NamespaceUnAliasDialogTs.ts'

    export default class NamespaceUnAliasDialog extends NamespaceUnAliasDialogTs {

    }
</script>

<style scoped>

</style>
