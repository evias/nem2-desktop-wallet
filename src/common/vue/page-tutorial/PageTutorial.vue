<template>
    <div class="right_container radius">
      <p class="right_container_head">{{$t(pageTitle)}}</p>

      <div v-for="(title, i) in titles">
        <p class="second_head">{{$t(titles[i])}}</p>
        <p>{{$t(explanations[i])}}</p>
      </div>
    </div>
</template>

<script lang="ts">
    import {PageTutorialTs} from '@/common/vue/page-tutorial/PageTutorialTs.ts'
    export default class PageTutorial extends PageTutorialTs {
    }
</script>
<style scoped lang="less">
  @import "PageTutorial.less";
</style>
