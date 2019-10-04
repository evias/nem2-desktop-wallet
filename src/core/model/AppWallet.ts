import {Message} from "@/config/index.ts"
import {localRead, localSave} from "@/core/utils/utils.ts"
import {
    Account,
    Crypto,
    NetworkType,
    Transaction,
    SimpleWallet,
    Password,
    WalletAlgorithm,
    Listener,
    Id, AccountHttp, Address,
} from 'nem2-sdk'
import CryptoJS from 'crypto-js'
import {AccountApiRxjs} from "@/core/api/AccountApiRxjs.ts"
import {MultisigApiRxjs} from "@/core/api/MultisigApiRxjs.ts"
import {TransactionApiRxjs} from '@/core/api/TransactionApiRxjs.ts'
import {createSubWalletByPath} from "@/core/utils/hdWallet.ts"
import {AppLock} from "@/core/utils/appLock"
import {CreateWalletType} from "@/core/model/CreateWalletType"
import {WebClient} from "@/core/utils"

export class AppWallet {
    constructor(wallet?: {
        name?: string,
        simpleWallet?: SimpleWallet
    }) {
        Object.assign(this, wallet)
    }

    name: string | undefined
    simpleWallet: SimpleWallet | undefined
    address: string | undefined
    publicKey: string | undefined
    networkType: NetworkType | undefined
    active: boolean | undefined
    style: string | undefined
    balance: number | 0
    encryptedMnemonic: string | undefined
    path: string
    sourceType: string
    createTimestamp: number
    importance: number

    generateWalletTitle(createType: string, coinType: string, netType: string) {
        return `${createType}-${coinType}-${netType}`
    }

    createFromPrivateKey(name: string,
                         password: Password,
                         privateKey: string,
                         networkType: NetworkType,
                         store: any): AppWallet {
        try {
            this.simpleWallet = SimpleWallet.createFromPrivateKey(name, password, privateKey, networkType)
            this.name = name
            this.address = this.simpleWallet.address.plain()
            this.publicKey = Account.createFromPrivateKey(privateKey, networkType).publicKey
            this.networkType = networkType
            this.active = true
            this.sourceType = CreateWalletType.privateKey
            this.createTimestamp = new Date().valueOf()
            this.addNewWalletToList(store)
            return this
        } catch (error) {
            throw new Error(error)
        }
    }

    createFromPath(
        name: string,
        password: Password,
        path: string,
        networkType: NetworkType,
        store: any): AppWallet {
        try {
            const accountName = store.state.account.accountName
            let accountMap = localRead('accountMap') === '' ? {} : JSON.parse(localRead('accountMap'))
            const mnemonic = AppLock.decryptString(accountMap[accountName].seed, password.value)
            const account = createSubWalletByPath(mnemonic, path)
            this.simpleWallet = SimpleWallet.createFromPrivateKey(name, password, account.privateKey, networkType)
            this.name = name
            this.address = this.simpleWallet.address.plain()
            this.publicKey = account.publicKey
            this.networkType = networkType
            this.active = true
            this.createTimestamp = new Date().valueOf()
            this.path = path
            this.sourceType = CreateWalletType.seed
            this.encryptedMnemonic = AppLock.encryptString(mnemonic, password.value)
            this.addNewWalletToList(store)
            return this
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }

    createFromMnemonic(
        name: string,
        password: Password,
        mnemonic: string,
        networkType: NetworkType,
        store: any): AppWallet {
        try {
            const path = `m/44'/43'/1'/0/0`
            const accountName = store.state.account.accountName
            const accountMap = localRead('accountMap') === '' ? {} : JSON.parse(localRead('accountMap'))
            const account = createSubWalletByPath(mnemonic, path)  // need put in configure
            this.simpleWallet = SimpleWallet.createFromPrivateKey(name, password, account.privateKey, networkType)
            this.name = name
            this.address = this.simpleWallet.address.plain()
            this.publicKey = account.publicKey
            this.networkType = networkType
            this.active = true
            this.createTimestamp = new Date().valueOf()
            this.path = path
            this.sourceType = CreateWalletType.seed
            this.encryptedMnemonic = AppLock.encryptString(mnemonic, password.value)
            accountMap[accountName].seed = this.encryptedMnemonic
            localSave('accountMap', JSON.stringify(accountMap))
            this.addNewWalletToList(store)
            return this
        } catch (error) {
            throw new Error(error)
        }
    }

    createFromTrezor(
        name: string,
        networkType: NetworkType,
        path: string,
        publicKey: string,
        address: string,
        store: any): AppWallet {
        try {
            const accountMap = localRead('accountMap') === '' ? {} : JSON.parse(localRead('accountMap'))
            this.name = name
            this.address = address
            this.publicKey = publicKey
            this.networkType = networkType
            this.active = true
            this.path = path
            this.sourceType = CreateWalletType.trezor
            localSave('accountMap', JSON.stringify(accountMap))
            this.addNewWalletToList(store)
            return this
        } catch (error) {
            throw new Error(error)
        }
    }

    createFromKeystore(name: string,
                       password: Password,
                       keystoreStr: string,
                       networkType: NetworkType,
                       store: any): AppWallet {
        try {
            this.name = name
            this.networkType = networkType
            const words = CryptoJS.enc.Base64.parse(keystoreStr)
            const keystore = words.toString(CryptoJS.enc.Utf8)
            this.simpleWallet = JSON.parse(keystore)
            this.sourceType = CreateWalletType.keyStore
            const {privateKey} = this.getAccount(password)
            this.createFromPrivateKey(name, password, privateKey, networkType, store)
            return this
        } catch (error) {
            throw new Error(error)
        }
    }

    getAccount(password: Password): Account {
        // @TODO: update after nem2-sdk EncryptedPrivateKey constructor definition is fixed
        // https://github.com/nemtech/nem2-sdk-typescript-javascript/issues/241
        const {encryptedKey, iv} = this.simpleWallet.encryptedPrivateKey

        const common = {password: password.value, privateKey: ''}
        const wallet = {encrypted: encryptedKey, iv}
        Crypto.passwordToPrivateKey(common, wallet, WalletAlgorithm.Pass_bip32)
        const privateKey = common.privateKey
        return Account.createFromPrivateKey(privateKey, this.networkType)
    }

    getMnemonic(password: Password): string {
        if (this.encryptedMnemonic === undefined) throw new Error('This wallet has no encrypted mnemonic')
        try {
            return AppLock.decryptString(this.encryptedMnemonic, password.value)
        } catch (error) {
            throw new Error('Could not decrypt the mnemonic')
        }
    }

    getKeystore(): string {
        const parsed = CryptoJS.enc.Utf8.parse(JSON.stringify(this.simpleWallet))
        return CryptoJS.enc.Base64.stringify(parsed)
    }

    checkPassword(password: Password): boolean {
        try {
            this.getAccount(password)
            return true
        } catch (error) {
            return false
        }
    }

    updatePassword(oldPassword: Password, newPassword: Password, store: any): void {
        const account = this.getAccount(oldPassword)
        this.createFromPrivateKey(this.name,
            newPassword,
            account.privateKey,
            this.networkType,
            store)
    }

    addNewWalletToList(store: any): void {
        const accountName = store.state.account.accountName
        const accountMap = localRead('accountMap') === ''
            ? {} : JSON.parse(localRead('accountMap'))
        const localData = accountMap[accountName].wallets

        this.style = this.style || `walletItem_bg_${String(Number(localData.length) % 3)}`

        if (!localData.length) {
            AppWallet.switchWallet(this.address, [this], store)
            return
        }

        let dataToStore = [...localData]
        const walletIndex = dataToStore.findIndex(({address}) => address === this.address)
        if (walletIndex > -1) dataToStore.splice(walletIndex, 1)

        AppWallet.switchWallet(this.address, [this, ...dataToStore], store)
    }

    delete(store: any, that: any) {
        const list = [...store.state.app.walletList]
        const accountName = store.state.account.accountName
        const accountMap = localRead('accountMap') === ''
            ? {} : JSON.parse(localRead('accountMap'))

        const walletIndex = list.findIndex(({address}) => address === this.address)
        if (walletIndex === -1) throw new Error('The wallet was not found in the list')
        list.splice(walletIndex, 1)
        store.commit('SET_WALLET_LIST', list)
        accountMap[accountName].wallets = list
        localSave('accountMap', JSON.stringify(accountMap))

        if (list.length < 1) {
            store.commit('SET_HAS_WALLET', false)
            store.commit('SET_WALLET', {})
        }

        if (store.state.account.wallet.address === this.address) {
            list[0].active = true
            store.commit('SET_WALLET', list[0])
        }

        that.$Notice.success({
            title: that['$t']('Delete_wallet_successfully') + '',
        })
        // this.$emit('hasWallet')
    }


    static switchWallet(newActiveWalletAddress: string, walletList: any, store: any) {
        const newWalletIndex = walletList.findIndex(({address}) => address === newActiveWalletAddress)
        if (newWalletIndex === -1) throw new Error('wallet not found when switching')

        const accountName = store.state.account.accountName
        const accountMap = localRead('accountMap') === ''
            ? {} : JSON.parse(localRead('accountMap'))

        let newWallet = walletList[newWalletIndex]
        newWallet.active = true
        let newWalletList = [...walletList]
        newWalletList
            .filter(wallet => wallet.address !== newActiveWalletAddress)
            .map(wallet => wallet.active = false)

        newWalletList.splice(newWalletIndex, 1)
        const walletListToStore = [newWallet, ...newWalletList]

        store.commit('SET_WALLET_LIST', walletListToStore)
        store.commit('SET_WALLET', newWallet)

        accountMap[accountName].wallets = walletListToStore
        localSave('accountMap', JSON.stringify(accountMap))
    }

    static async getAccountInfo(store): Promise<any> {
        try {
            const accountInfo = await new AccountHttp(store.state.account.node)
                .getAccountInfo(Address.createFromRawAddress(store.state.account.wallet.address))
                .toPromise()
            store.commit('SET_ACCOUNT_INFO', accountInfo)
            return accountInfo
        } catch (error) {
            return 0
        }
    }

    async updateAccountBalance(balance: number, store: any): Promise<void> {
        try {
            this.balance = balance
            this.updateWallet(store)
            store.commit('SET_BALANCE_LOADING', false)
        } catch (error) {
            store.commit('SET_BALANCE_LOADING', false)
            // do nothing
        }
    }

    updateWalletName(
        accountName: string,
        newWalletName: string,
        walletAddress: string,
        store: any
    ) {
        let accountMap = JSON.parse(localRead('accountMap'))
        accountMap[accountName]['wallets'].every((item, index) => {
            if (item.address == walletAddress) {
                accountMap[accountName]['wallets'][index].name = newWalletName
                return false
            }
            return true
        })

        localSave('accountMap', JSON.stringify(accountMap))
        store.commit('SET_WALLET_LIST', accountMap[accountName]['wallets'])
    }


    updateWallet(store: any) {
        const accountName = store.state.account.accountName
        const accountMap = localRead('accountMap') === ''
            ? {} : JSON.parse(localRead('accountMap'))
        const localData: any[] = accountMap[accountName].wallets
        if (!localData.length) throw new Error('error at update wallet, no wallets in storage')

        let newWalletList = [...localData]
        const newWalletIndex = localData.findIndex(({address}) => address === this.address)

        if (newWalletIndex === -1) throw new Error('wallet not found when updating')

        newWalletList[newWalletIndex] = this

        store.commit('SET_WALLET_LIST', newWalletList)
        if (store.state.account.address === this.address) store.commit('SET_WALLET', this)
        accountMap[accountName].wallets = newWalletList
        localSave('accountMap', JSON.stringify(accountMap))
    }

    async setMultisigStatus(node: string, store: any): Promise<void> {
        try {
            const multisigAccountInfo = await new AccountApiRxjs().getMultisigAccountInfo(this.address, node).toPromise()
            store.commit('SET_MULTISIG_ACCOUNT_INFO', {address: this.address, multisigAccountInfo})
            store.commit('SET_MULTISIG_LOADING', false)
        } catch (error) {
            store.commit('SET_MULTISIG_ACCOUNT_INFO', {address: this.address, multisigAccountInfo: null})
            store.commit('SET_MULTISIG_LOADING', false)
        }
    }

    async getAccountBalance(store: any): Promise<AppWallet> {
        try {
            const {node, currentXEM1, xemDivisibility} = store.getters

            const accountInfo = await new AccountApiRxjs()
                .getAccountInfo(this.address, node)
                .toPromise()

            if (!accountInfo.mosaics.length) {
                this.balance = 0
                return this
            }

            const xemIndex = accountInfo.mosaics
                .findIndex(mosaic => mosaic.id.toHex() === currentXEM1)

            if (xemIndex === -1)  {
                this.balance = 0
                return this
            }

            this.balance = accountInfo.mosaics[xemIndex].amount.compact() / Math.pow(10, xemDivisibility)
            return this
        } catch (error) {
            this.balance = 0
            return this
        }
    }

    signAndAnnounceNormal(password: Password, node: string, generationHash: string, transactionList: Array<any>, that: any): void {
        try {
            const account = this.getAccount(password)
            const signature = account.sign(transactionList[0], generationHash)
            const message = that.$t(Message.SUCCESS)
            console.log(transactionList)
            console.log(signature)
            new TransactionApiRxjs().announce(signature, node).subscribe(() => {
                that.$Notice.success({title: message}) // quick fix
            })
        } catch (err) {
            console.error(err)
            that.$Notice.error({title: err})
        }
    }

    signAndAnnounceBonded = (
        password: Password,
        lockFee: number,
        node: string,
        generationHash: string,
        transactionList: Array<any>,
        currentXEM1: string,
        networkType: NetworkType,
    ) => {
        const account = this.getAccount(password)
        const aggregateTransaction = transactionList[0]
        const listener = new Listener(node.replace('http', 'ws'), WebSocket)
        new TransactionApiRxjs().announceBondedWithLock(
            aggregateTransaction,
            account,
            listener,
            node,
            generationHash,
            networkType,
            lockFee,
            currentXEM1,
        )
    }
}

export const createBondedMultisigTransaction = (transaction: Array<Transaction>, multisigPublicKey: string, networkType: NetworkType, fee: number) => {
    return new MultisigApiRxjs().bondedMultisigTransaction(networkType, fee, multisigPublicKey, transaction)
}

export const createCompleteMultisigTransaction = (transaction: Array<Transaction>, multisigPublicKey: string, networkType: NetworkType, fee: number) => {
    return new MultisigApiRxjs().completeMultisigTransaction(networkType, fee, multisigPublicKey, transaction)
}

export const getCurrentImportance = async (store: any) => {
    const {address} = store.state.account.wallet
    const {node} = store.state.account
    const resStr = await WebClient.request('', {
        url: `${node}/account/${address}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).catch(
        store.commit('SET_WALLET_IMPORTANCE', 0)
    )
    const importance = JSON.parse(resStr + '').account ? new Id(JSON.parse(resStr + '').account.importance).compact() : 0
    store.commit('SET_WALLET_IMPORTANCE', Number(importance))
}

export const saveLocalAlias = (
    address: string,
    aliasObject: {
        tag: string,
        alias: string,
        address: string
    }) => {
    const addressBookData = localRead('addressBook')
    let addressBook = addressBookData ? JSON.parse(addressBookData) : {}
    addressBook[address] = addressBook[address] || {}
    addressBook[address]['aliasMap'] = addressBook[address]['aliasMap'] || {}
    addressBook[address]['aliasMap'][aliasObject.alias] = aliasObject

    addressBook[address]['tagMap'] = addressBook[address]['tagMap'] || {}
    addressBook[address]['tagMap'][aliasObject.tag] = addressBook[address]['tagMap'][aliasObject.tag] || []
    addressBook[address]['tagMap'][aliasObject.tag].push(aliasObject.alias)

    localSave('addressBook', JSON.stringify(addressBook))
}


export const readLocalAlias = (address: string) => {
    const addressBookData = localRead('addressBook')
    if (!addressBookData) return {}
    return JSON.parse(addressBookData)[address]
}
export const removeLink = (aliasObject, address) => {
    const {alias, tag} = aliasObject
    const addressBook = JSON.parse(localRead('addressBook'))
    delete addressBook[address].aliasMap[alias]
    addressBook[address].tagMap[tag].splice(addressBook[address].tagMap[tag].indexOf(alias), 1)
    localSave('addressBook', JSON.stringify(addressBook))
}
