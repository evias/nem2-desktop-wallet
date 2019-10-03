<template>
  <div class="transaction_content secondary_page_animate">
    <div class="left_container radius ">
      <div class="bottom_transfer_info scroll ">
        <div class="multisig">
          <MosaicDefinitionForm is-embedded></MosaicDefinitionForm>
        </div>
      </div>
    </div>

    <PageTutorial :pageTitle="'tutorial_mosaic_page_title'"
                  :titles="['tutorial_mosaic_title_1', 'tutorial_mosaic_title_2', 'tutorial_mosaic_title_3']"
                  :explanations="['tutorial_mosaic_explanation_1', 'tutorial_mosaic_explanation_2', 'tutorial_mosaic_explanation_3']"
                  />

    <CollectionRecord :filterType="transactionType.MosaicDefinition" />
  </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {MosaicDefinitionPageTs} from '@/views/service/transaction/pages/MosaicDefinitionPageTs.ts'


    export default class MosaicDefinitionPage extends MosaicDefinitionPageTs {

    }
</script>
<style scoped lang="less">
  @import "MosaicDefinitionPage.less";
</style>
