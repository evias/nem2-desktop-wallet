import {FormattedTransaction} from '@/core/model'
import {getRelativeMosaicAmount} from '@/core/utils'
import {Address, NamespaceId, TransferTransaction} from 'nem2-sdk'

export class FormattedTransfer extends FormattedTransaction {
    infoFirst: string
    infoSecond: string
    infoThird: any
    dialogDetailMap: any

    constructor(    tx: TransferTransaction,
                    address: Address,
                    currentXem: string,
                    xemDivisibility: number,
                    store: any) {
        super(tx, address, currentXem, xemDivisibility, store)

        const {rawTx}: any = this

        const from = rawTx.signer.address.plain();
        const to = rawTx.recipient instanceof Address ? (rawTx.recipient as Address).plain() : (rawTx.recipient as NamespaceId).toHex();

        this.dialogDetailMap = {
            'transfer_type': this.txHeader.tag,
            'from': from,
            'to': to,
            'mosaic': rawTx.mosaics,
            'fee': getRelativeMosaicAmount(rawTx.maxFee.compact(), xemDivisibility) + 'XEM',
            'block': this.txHeader.block,
            'hash': this.txHeader.hash,
            'message': rawTx.message.payload
        }
    }
}

