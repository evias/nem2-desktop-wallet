import {
    MosaicDefinitionTransaction,
    Deadline,
    MosaicNonce,
    MosaicId,
    NamespaceMosaicIdGenerator,
    AggregateTransaction,
    UInt64,
    MosaicSupplyChangeTransaction,
    MosaicHttp,
    Convert,
    NetworkCurrencyMosaic,
    MosaicSupplyChangeAction,
    PublicAccount,
    MosaicFlags
} from 'nem2-sdk'
import {from as observableFrom} from "rxjs"

export class MosaicApiRxjs {
    getMosaicByNamespace(namespace: string) {
        const uintArray = NamespaceMosaicIdGenerator.namespaceId(namespace)
        return new MosaicId(uintArray)
    }

    createMosaicNonce(nonce?: Uint8Array) {
        nonce = nonce || convertNonce(Math.ceil(Math.random() * 1000))
        return (new MosaicNonce(nonce))

        function convertNonce(input: number) {
            const hex = input.toString(16)
            const hex2 = '0000000'.concat(hex).substr(-8)
            return Convert.hexToUint8(hex2).reverse()
        }
    }

    createMosaicId(publicAccount: PublicAccount, mosaicNonce: any) {
        return MosaicId.createFromNonce(mosaicNonce, publicAccount)
    }

    createMosaic(mosaicNonce: any,
                 mosaicId: any,
                 supplyMutable: boolean,
                 transferable: boolean,
                 divisibility: number,
                 duration: number | undefined,
                 netWorkType: number,
                 supply: number,
                 publicAccount: PublicAccount,
                 restrictable: boolean,
                 maxFee?: number) {
        const mosaicDefinitionTx = MosaicDefinitionTransaction.create(
            Deadline.create(),
            mosaicNonce,
            mosaicId,
            MosaicFlags.create(supplyMutable, transferable, restrictable),
            divisibility,
            duration ? UInt64.fromUint(duration) : undefined,
            netWorkType,
            maxFee ? UInt64.fromUint(maxFee) : undefined
        )

        const mosaicSupplyChangeTx = MosaicSupplyChangeTransaction.create(
            Deadline.create(),
            mosaicDefinitionTx.mosaicId,
            MosaicSupplyChangeAction.Increase,
            UInt64.fromUint(supply),
            netWorkType
        )
        return AggregateTransaction.createComplete(
            Deadline.create(),
            [
                mosaicDefinitionTx.toAggregate(publicAccount),
                mosaicSupplyChangeTx.toAggregate(publicAccount)
            ],
            netWorkType,
            [],
            UInt64.fromUint(maxFee)
        )
    }

    mosaicSupplyChange(mosaicId: any,
                       delta: number,
                       MosaicSupplyChangeAction: number,
                       netWorkType: number,
                       maxFee?: number) {
        return MosaicSupplyChangeTransaction.create(
            Deadline.create(),
            mosaicId,
            MosaicSupplyChangeAction,
            UInt64.fromUint(delta),
            networkType,
            maxFee ? UInt64.fromUint(maxFee) : undefined
        )
    }

    getMosaics(node: string, mosaicIdList: MosaicId[]) {
        return observableFrom(new MosaicHttp(node).getMosaics(mosaicIdList))
    }

    getMosaicsNames(node: string, mosaicIds: any[]) {
        return observableFrom(new MosaicHttp(node).getMosaicsNames(mosaicIds))
    }
}
