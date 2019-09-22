import {from as observableFrom} from "rxjs"
import {BlockHttp} from 'nem2-sdk'


export class BlockApiRxjs {
    /**
     *  getBlocksByHeightWithLimit
     * @param node
     * @param height
     * @param limit
     */
    public getBlocksByHeightWithLimit(node: string, height: number, limit: number) {
        return observableFrom(new BlockHttp(node).getBlocksByHeightWithLimit(height, limit))
    }

    /**
     *  getBlockTransactions
     * @param node
     * @param height
     * @param queryParams
     */
    public getBlockTransactions(node: string, height: number, queryParams: any) {
        return observableFrom(new BlockHttp(node).getBlockTransactions(height, queryParams))
    }
}
