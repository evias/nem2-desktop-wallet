/**
 * Copyright 2020 NEM Foundation (https://nem.io)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Component, Vue} from 'vue-property-decorator'
import {mapGetters} from 'vuex'

// child components
// @ts-ignore
import DisabledUiOverlay from '@/components/DisabledUiOverlay/DisabledUiOverlay.vue'
// @ts-ignore
import TransactionConfirmation from '@/components/TransactionConfirmation/TransactionConfirmation.vue'
// @ts-ignore
import SpinnerLoading from '@/components/SpinnerLoading/SpinnerLoading.vue'

@Component({
  computed: {
    ...mapGetters({
      hasLoadingOverlay: 'app/hasLoadingOverlay',
      currentPeer: 'network/currentPeer',
      currentAccount: 'account/currentAccount'
    })
  },
  components: {
    DisabledUiOverlay,
    TransactionConfirmation,
    SpinnerLoading,
  },
})
export class AppTs extends Vue {
  /**
   * Whether the app is running on windows platform
   * @var {boolean}
   */
  public isWindows = process.platform === 'win32'

  /**
   * Currently active account
   * @see {Store.Account}
   * @var {string}
   */
  public currentAccount: string

  /**
   * Currently active peer
   * @see {Store.Network}
   * @var {Object}
   */
  public currentPeer: Object

  /**
   * Whether a loading overlay must be displayed
   * @see {Store.App}
   * @var {boolean}
   */
  public hasLoadingOverlay: boolean

  /**
   * Hook called when the app is mounted
   * @return {void}
   */
  mounted() {
    if (! this.currentAccount || ! this.currentAccount.length)
      this.$router.push({name: 'login'})
  }
}
