<template>
  <div class="mosaicList secondary_page_animate">

    <div class="left_container radius">
      <div>
        <p class="mosaic_head_title">
          {{$t('NEM_mosaic')}}
        </p>
        <p class="mosaic_head_title_info">
          {{$t('NEM_Mosaic_is_a_smart_asset_with_rich_attributes_and_features_To_create_a_mosaic_you_must_provision_the_root_namespace_for_your_account')}}
        </p>
      </div>
      <div class="mosaicListBody">
        <div class="listTit">
          <span class="mosaic_id" @click="getSortType(mosaicSortType.byId)">
               {{$t('mosaic_ID')}}
            <Icon v-if="mosaicSortType.byId == currentSortType" class="active_sort_type" type="md-arrow-dropdown"/>
            </span>

          <span class="available_quantity" @click="getSortType(mosaicSortType.bySupply)">
              {{$t('available_quantity')}}
            <Icon v-if="mosaicSortType.bySupply == currentSortType" class="active_sort_type" type="md-arrow-dropdown"/>
            </span>

          <span class="mosaic_divisibility" @click="getSortType(mosaicSortType.byDivisibility)">
              {{$t('mosaic_divisibility')}}
            <Icon v-if="mosaicSortType.byDivisibility == currentSortType" class="active_sort_type"
                  type="md-arrow-dropdown"/>
            </span>

          <span class="transportability" @click="getSortType(mosaicSortType.byTransferable)">

            {{$t('transportability')}}
            <Icon v-if="mosaicSortType.byTransferable == currentSortType" class="active_sort_type"
                  type="md-arrow-dropdown"/>

            </span>

          <span class="variable_supply" @click="getSortType(mosaicSortType.bySupplyMutable)">
              {{$t('variable_supply')}}
            <Icon v-if="mosaicSortType.bySupplyMutable == currentSortType" class="active_sort_type"
                  type="md-arrow-dropdown"/>
            </span>

          <span class="deadline" @click="getSortType(mosaicSortType.byDuration)">
               {{$t('deadline')}}
            <Icon v-if="mosaicSortType.byDuration == currentSortType" class="active_sort_type"
                  type="md-arrow-dropdown"/>
            </span>

          <span class="Restrictable" @click="getSortType(mosaicSortType.byRestrictable)">
               {{$t('Restrictable')}}
            <Icon v-if="mosaicSortType.byRestrictable == currentSortType" class="active_sort_type"
                  type="md-arrow-dropdown"/>
            </span>

          <span class="alias" @click="getSortType(mosaicSortType.byAlias)">
               {{$t('alias')}}
            <Icon v-if="mosaicSortType.byAlias == currentSortType" class="active_sort_type" type="md-arrow-dropdown"/>
            </span>
          <!--              <div class="mosaic_filter" @click="toggleIsShowExpiredMosaic()">-->
          <!--                <img v-if="!isShowExpiredMosaic" src="@/common/img/window/windowSelected.png">-->
          <!--                <img v-else src="@/common/img/window/windowUnselected.png">-->
          <!--                <span>{{$t('Hide_expired_namespaces')}}</span>-->
          <!--              </div>-->
        </div>
        <Spin v-if="mosaicsLoading" size="large" fix class="absolute"></Spin>
        <div class="no_data" v-if="false">{{$t('no_data')}}</div>
        <div
                v-for="(value, index) in currentMosaicList.slice((currentPage-1)*pageSize,currentPage*pageSize)"
                :key="index"
                class="listItem"
        >
          <Row>
            <span class="mosaic_id">{{value.hex}}</span>
            <span class="available_quantity">{{value.mosaicInfo?formatNumber(value.mosaicInfo.supply.compact()):0}}</span>
            <span class="mosaic_divisibility">{{value.properties?value.properties.divisibility:0}}</span>
            <span class="transportability">
              <Icon v-if="value.properties?value.properties.transferable:0" type="md-checkmark"/>
              <Icon v-else type="md-close"/>
            </span>
            <span class="variable_supply">
              <Icon v-if="value.properties?value.properties.supplyMutable:0" type="md-checkmark"/>
              <Icon v-else type="md-close"/>
            </span>
            <span class="deadline">
              {{computeDuration(value) <= 0 ? $t('overdue') : (computeDuration(value) === 'Forever'?
              $t('forever') : formatNumber(computeDuration(value)))}}
            </span>
            <span class="Restrictable">
              <Icon v-if="value.isRestrictable" type="md-checkmark"/>
              <Icon v-else type="md-close"/>
            </span>

            <span class="alias">
              {{value.name?value.name:'N/A'}}
            </span>

            <span class="poptip">
              <div
                      class="listFnDiv"
                      v-if="computeDuration(value) > 0 || computeDuration(value) === 'Forever'"
              >
                <Poptip placement="bottom">
                  <i class="moreFn"></i>
                  <div slot="content" class="updateFn">
                    <p class="fnItem" @click="showEditDialog(value)" v-if="value.supplyMutable">
                      <i><img src="@/common/img/service/updateMsaioc.png"></i>
                      <span class="">{{$t('modify_supply')}}</span>
                    </p>
                    <p class="fnItem" @click="showAliasDialog(value)">
                      <i><img src="@/common/img/service/setAlias.png"></i>
                      <span>{{$t('binding_alias')}}</span>
                    </p>

                    <p class="fnItem" @click="showUnAliasDialog(value)" v-if="value.name">
                      <i><img src="@/common/img/service/clearAlias.png"></i>
                      <span>{{$t('unbind')}}</span>
                    </p>
                  </div>
                </Poptip>
              </div>
            </span>
          </Row>
        </div>
        <div class="page_container ">
          <Page
                  class="page"
                  :total="currentMosaicList.length"
                  @on-change="toggleChange"
                  :page-size="pageSize"
          />
        </div>
      </div>
    </div>

    <div class="right_container radius">
      <p class="right_container_title">{{$t('mosaic_assets')}}</p>
      <p>{{$t('describe')}}</p>
      <p class="green_text">{{$t('mosaic_describe_text')}}</p>
      <p>{{$t('attribute')}}</p>
      <p class="green_text">{{$t('mosaic_attribute_text')}}</p>
      <p>{{$t('mosaic_attribute_text_2')}}</p>
    </div>
    <MosaicAliasDialog :showMosaicAliasDialog="showMosaicAliasDialog" :itemMosaic="selectedMosaic"
                       @closeMosaicAliasDialog="closeMosaicAliasDialog"></MosaicAliasDialog>
    <MosaicUnAliasDialog :showMosaicUnAliasDialog="showMosaicUnAliasDialog" :itemMosaic="selectedMosaic"
                         @closeMosaicUnAliasDialog="closeMosaicUnAliasDialog"></MosaicUnAliasDialog>
    <EditDialog :showMosaicEditDialog="showMosaicEditDialog" :itemMosaic="selectedMosaic"
                @closeMosaicEditDialog="closeMosaicEditDialog"></EditDialog>
  </div>
</template>

<script lang="ts">
    import {MosaicListTs} from '@/views/service/mosaic/mosaic-function/mosaic-list/MosaicListTs.ts'
    import "./MosaicList.less"

    export default class MosaicList extends MosaicListTs {

    }
</script>
<style scoped lang="less">

</style>
