import Vuex from 'vuex'
import vueStore from '@/store/index.ts'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import iView from 'iview'
// @ts-ignore
import MonitorReceipt from '@/views/monitor/monitor-receipt/MonitorReceipt.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(iView);
const router = new VueRouter()

describe('MonitorReceipt', () => {
    let store
    beforeEach(() => {
            store = vueStore
        }
    )
it('Component MonitorReceipt is not null', () => {
    const wrapper = shallowMount(MonitorReceipt, {
        mocks: {
            $t: (msg) => msg
        },localVue,
        router,store
    })
    expect(wrapper).not.toBeNull()
})})

