import { BIPPath } from "bip32-path";
// import LedgerNode from '@ledgerhq/hw-transport-u2f';
// import TransportWebUSB from "@ledgerhq/hw-transport-webusb"
// import { LedgerTransport, SendParams } from './ledgerTransport';

/**
 * NEM API
 *
 * @example
 * import Nem from "@ledgerhq/hw-app-nem";
 * const nem = new Nem(transport);
   recognize networkId by bip32Path;
      "44'/43'/networkId'/walletIndex'/accountIndex'"
      
   const bip32path_mijin_testnet = "44'/43'/144'/1'/2'"
   const bip32path_mijin_mainnet "44'/43'/96'/3'/1'"
   const bip32path_nem_mainnet = "44'/43'/104'/5'/1'"
 */

const MAX_CHUNK_SIZE = 255;

export class NemLedger {
    transport;

    constructor(transport, scrambleKey = "NEM") {
        this.transport = transport;
        transport.decorateAppAPIMethods(this, ["getAddress", "signTransaction", "getAppConfiguration"], scrambleKey);
    }

    /**
     * get NEM address for a given BIP 32 path.
     *
     * @param path a path in BIP 32 format
     * @param display optionally enable or not the display
     * @param chainCode optionally enable or not the chainCode request
     * @param ed25519
     * @return an object with a publicKey, address and (optionally) chainCode
     * @example
     * const result = await nem.getAddress(bip32path);
     * const { publicKey, address } = result;
     */
    async getAddress(path) {
        const display = false;
        const chainCode = false;
        const ed25519 = true;

        const bipPath = BIPPath.fromString(path).toPathArray();
        const curveMask = ed25519 ? 0x80 : 0x40;

        const cla = 0xe0;
        const ins = 0x02;
        const p1 = display ? 0x01 : 0x00;
        const p2 = curveMask | (chainCode ? 0x01 : 0x00);
        const data = Buffer.alloc(1 + bipPath.length * 4);

        data.writeInt8(bipPath.length, 0);
        bipPath.forEach((segment, index) => {
            data.writeUInt32BE(segment, 1 + index * 4);
        });

        const response = await this.transport.send(cla, ins, p1, p2, data);

        var result = {
            address: "",
            publicKey: "",
            path: ""
        };
        const addressLength = response[0];
        const publicKeyLength = response[1 + addressLength];
        result.address = response.slice(1, 1 + addressLength).toString("ascii");
        result.publicKey = response.slice(1 + addressLength + 1, 1 + addressLength + 1 + publicKeyLength).toString("hex");
        result.path = path;
        return result;
    }
}
