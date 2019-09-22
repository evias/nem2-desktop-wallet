import {Component, Vue} from 'vue-property-decorator'
import MultisigMap from './multisig-functions/multisig-map/MultisigMap.vue'
import MultisigConversion from './multisig-functions/multisig-conversion/MultisigConversion.vue'
import MultisigManagement from './multisig-functions/multisig-management/MultisigManagement.vue'
import {multisigButtonConfig} from "@/config/view/multisig";


@Component({
    components: {
        MultisigMap,
        MultisigConversion,
        MultisigManagement,
    }
})
export class MultisigTs extends Vue {

    buttonList = multisigButtonConfig

    switchButton(index) {
        let list = this.buttonList
        list = list.map((item) => {
            item.isSelected = false
            return item
        })
        list[index].isSelected = true
        this.buttonList = list
    }

}
