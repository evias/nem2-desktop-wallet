import {NetworkType} from "nem2-sdk"

export const formDataConfig = {
    multisigTransferForm: {
        address: 'SCSXIT-R36DCY-JRVSNE-NY5BUA-HXSL7I-E6ULEY-UYRC',
        remark: '',
        multisigPublickey: '',
        innerFee: 1,
        lockFee: 10,
        aggregateFee: 1,
        mosaicTransferList: [],
        isEncrypted: true
    },
    transferForm: {
        fee: 0.5,
        remark: '',
        address: 'SCSXIT-R36DCY-JRVSNE-NY5BUA-HXSL7I-E6ULEY-UYRC',
        mosaicTransferList: [],
        isEncrypted: true
    },
    remoteForm: {
        remotePublickey: '',
        fee: 0.5,
        password: ''
    },
    mosaicAliasForm: {
        aliasName: '',
        fee: 0.5,
        password: ''
    },
    mosaicEditForm: {
        id: '',
        aliasName: '',
        delta: 0,
        supplyType: 1,
        changeDelta: 0,
        duration: '',
        fee: 0.5,
        password: ''
    },
    mosaicUnaliasForm: {
        fee: 0.5,
        password: ''
    },
    mosaicTransactionForm: {
        restrictable: false,
        supply: 500000000,
        divisibility: 0,
        transferable: true,
        supplyMutable: true,
        permanent: false,
        duration: 1000,
        innerFee: 0.5,
        aggregateFee: 0.5,
        lockFee: 0.5,
        multisigPublickey: ''
    },
    multisigConversionForm: {
        publickeyList: [],
        minApproval: 1,
        minRemoval: 1,
        bondedFee: 1,
        lockFee: 10,
        innerFee: 1
    },
    multisigManagementForm: {
        minApprovalDelta: 0,
        minRemovalDelta: 0,
        bondedFee: 1,
        lockFee: 10,
        innerFee: 1,
        cosignerList: [],
        multisigPublickey: ''
    },
    namesapceEditForm: {
        name: '',
        duration: 0,
        fee: 0.5,
        password: ''
    },
    rootNamespaceForm: {
        duration: 1000,
        rootNamespaceName: '',
        multisigPublickey: '',
        innerFee: 0.5,
        aggregateFee: 0.5,
        lockFee: 0.5
    },
    walletImportMnemonicForm: {
        mnemonic: '',
        networkType: 0,
        walletName: '',
    },
    walletImportPrivateKeyForm: {
        privateKey: 'FB628AF4276F696AD1FA85B7AB1E49CFD896E5EC85000E3179EEEA59717DD8DE',
        networkType: NetworkType.MIJIN_TEST,
        walletName: 'wallet-privateKey',
    },
    trezorImportForm: {
        networkType: 0,
        accountIndex: 0,
        walletName: 'Trezor Wallet'
    }
}
