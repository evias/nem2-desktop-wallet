import {NetworkType} from "nem2-sdk"
import {FEE_SPEEDS} from '@/config'

export const formDataConfig = {
    transferForm: {
        address: 'SCSXIT-R36DCY-JRVSNE-NY5BUA-HXSL7I-E6ULEY-UYRC',
        remark: '',
        multisigPublickey: '',
        feeSpeed: FEE_SPEEDS.NORMAL,
        mosaicTransferList: [],
        isEncrypted: true
    },
    remoteForm: {
        remotePublickey: '',
        feeSpeed: FEE_SPEEDS.NORMAL,
        password: ''
    },
    mosaicAliasForm: {
        aliasName: '',
        feeSpeed: FEE_SPEEDS.NORMAL,
        password: ''
    },
    mosaicEditForm: {
        id: '',
        aliasName: '',
        delta: 0,
        supplyType: 1,
        changeDelta: 0,
        duration: '',
        feeSpeed: FEE_SPEEDS.NORMAL,
        password: ''
    },
    mosaicUnaliasForm: {
        feeSpeed: FEE_SPEEDS.NORMAL,
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
        feeSpeed: FEE_SPEEDS.NORMAL,
        multisigPublickey: ''
    },
    multisigConversionForm: {
        publicKeyList: [],
        minApproval: 1,
        minRemoval: 1,
        feeSpeed: FEE_SPEEDS.NORMAL,
    },
    multisigManagementForm: {
        minApprovalDelta: 0,
        minRemovalDelta: 0,
        feeSpeed: FEE_SPEEDS.NORMAL,
        cosignerList: [],
        multisigPublicKey: ''
    },
    namespaceEditForm: {
        name: '',
        duration: 0,
        feeSpeed: FEE_SPEEDS.NORMAL,
        password: ''
    },
    rootNamespaceForm: {
        duration: 1000,
        rootNamespaceName: '',
        multisigPublickey: '',
        feeSpeed: FEE_SPEEDS.NORMAL,
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
    transactionURIForm: {
        payload: '',
        generationHash: ''
    },
    trezorImportForm: {
        networkType: 0,
        accountIndex: 0,
        walletName: 'Trezor Wallet'
    }
}
