import {FormattedTransaction} from '@/core/model'
import {getRelativeMosaicAmount} from '@/core/utils'
import {Address, Transaction} from 'nem2-sdk'
import {defaultNetworkConfig} from '@/config/index.ts';

export class FormattedAccountMetadataTransaction extends FormattedTransaction {
    dialogDetailMap: any
    icon: any

    constructor( tx: Transaction,
                address: Address,
                currentXem: string,
                xemDivisibility: number) {
        super(tx, address, currentXem, xemDivisibility)

        this.dialogDetailMap = {
            'transfer_type': this.txHeader.tag,
            'fee': getRelativeMosaicAmount(tx.maxFee.compact(), xemDivisibility) + defaultNetworkConfig.XEM,
            'block': this.txHeader.block,
            'hash': this.txHeader.hash,
        }
    }
}
