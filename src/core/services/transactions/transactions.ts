import {Transaction, Address} from "nem2-sdk"
import {TransactionApiRxjs} from '@/core/api/TransactionApiRxjs.ts'
import {transactionFormat} from '@/core/services/transactions'

// @TODO: refactor
export const formatAndSave = (  mosaicList,
                                transaction,
                                address,
                                currentXEM1,
                                xemDivisibility,
                                node,
                                currentXem,
                                store,
                                confirmed: boolean) => {
    const formattedTransactions = transactionFormat(
        [transaction],
        address,
        currentXEM1,
        xemDivisibility,
        node,
        currentXem,
    )
    
    if(confirmed) {
        store.commit('ADD_CONFIRMED_TRANSACTION', formattedTransactions)
        return
    }

    store.commit('ADD_UNCONFIRMED_TRANSACTION', formattedTransactions)
}

export const setTransactionList = (address, that) => {
    const context = that
    const {node} = that
    const add = Address.createFromRawAddress(address)

    new TransactionApiRxjs().transactions(
        add,
        {
        pageSize: 100
        },
        node,
    ).subscribe(async (transactionList: Transaction[]) => {
        try {
        const txList = transactionFormat(
                transactionList,
                address,
                context.currentXEM1,
                context.xemDivisibility,
                context.node,
                context.currentXem,
            )
        await that.$store.commit('SET_TRANSACTION_LIST', txList)
        that.$store.commit('SET_TRANSACTIONS_LOADING', false)
        } catch (error) {
            console.error(error)
        }
    })
}
