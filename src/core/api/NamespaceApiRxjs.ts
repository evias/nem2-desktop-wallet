import {
    Deadline,
    NamespaceId,
    NamespaceRegistrationTransaction,
    UInt64,
    MosaicAliasTransaction,
    AddressAliasTransaction,
    NamespaceHttp,
    NetworkType,
    AliasAction,
    MosaicId,
    Address,
} from 'nem2-sdk'

export class NamespaceApiRxjs {

    createNamespaceId(name: string | number[]) {
        return new NamespaceId(name)

    }

    createdRootNamespace(namespaceName: string, duration: number, networkType: NetworkType, maxFee?: number) {
        const deadline = Deadline.create()
        const durationUint = UInt64.fromUint(duration)
        return NamespaceRegistrationTransaction.createRootNamespace(
            deadline,
            namespaceName,
            durationUint,
            networkType,
            maxFee ? UInt64.fromUint(maxFee) : undefined
        )
    }

    createdSubNamespace(namespaceName: string,
                        parentNamespace: string | NamespaceId,
                        networkType: NetworkType,
                        maxFee?: number) {
        const deadline = Deadline.create()

        return NamespaceRegistrationTransaction.createSubNamespace(
            deadline,
            namespaceName,
            parentNamespace,
            networkType,
            maxFee ? UInt64.fromUint(maxFee) : undefined
        )

    }

    mosaicAliasTransaction(actionType: AliasAction,
                           namespaceId: NamespaceId,
                           mosaicId: MosaicId,
                           networkType: NetworkType,
                           maxFee?: number) {
        const deadline = Deadline.create()
        return MosaicAliasTransaction.create(
            deadline,
            actionType,
            namespaceId,
            mosaicId,
            networkType,
            maxFee ? UInt64.fromUint(maxFee) : undefined
        )
    }

    addressAliasTransaction(actionType: AliasAction,
                            namespaceId: NamespaceId,
                            address: Address,
                            networkType: NetworkType,
                            maxFee?: number) {
        const deadline = Deadline.create()
        return AddressAliasTransaction.create(
            deadline,
            actionType,
            namespaceId,
            address,
            networkType,
            maxFee ? UInt64.fromUint(maxFee) : undefined
        )
    }

    getLinkedMosaicId(
        namespaceId: NamespaceId,
        url: string
    ) {
        const namespaceHttp = new NamespaceHttp(url)
        return namespaceHttp.getLinkedMosaicId(namespaceId)

    }

    async getNamespacesFromAccount(address: Address, url: string) {
        let namespaces: any = []
        const namespaceHttp = new NamespaceHttp(url)
        let namespaceInfo = await namespaceHttp.getNamespacesFromAccount(address).toPromise()
        let namespaceIds = namespaceInfo.map((item) => {
            namespaces[item.id.toHex().toUpperCase()] = {namespaceInfo: item}
            return item.id
        })
        const namespaceName = await namespaceHttp.getNamespacesName(namespaceIds).toPromise()
        namespaces = namespaceName.map((item: any) => {
            let namespace = namespaces[item.namespaceId.toHex().toUpperCase()]
            // namespaceInfo may be undefined
            if (!namespace) return
            namespace.namespaceName = item.name
            return namespace
        })
        return {
            result: {
                NamespaceList: namespaces
            }
        }
    }

    getNamespace(namespaceId: NamespaceId, node: string) {
        return new NamespaceHttp(node).getNamespace(namespaceId)
    }


    /**
     * Gets array of NamespaceName for different namespaceIds
     * @param namespaceIds - Array of namespace ids
     * @returns Observable<NamespaceName[]>
     */
    getNamespacesName(namespaceIds: NamespaceId[], node: string) {
        return new NamespaceHttp(node).getNamespacesName(namespaceIds)
    }
}
