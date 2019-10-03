
import { extend } from 'vee-validate';
import { TransactionMapping, PublicAccount, NetworkType, Address, NamespaceId, } from 'nem2-sdk';

// internal dependencies
import {NETWORK_PARAMS} from '@/core/validation'

extend('required', {
    validate: value => !!value,
    message: 'The {_field_} field is required'
});

extend('payload', {
    validate(payload) {
        try {
            TransactionMapping.createFromPayload(payload)
            return true
        }
        catch(e) {
            return false
        }
    },
    message: 'The input must be a valid transaction payload in hexadecimal format'
});

extend('publicKey', {
    validate(publicKey) {
        try {
            PublicAccount.createFromPublicKey(publicKey, NetworkType.MIJIN_TEST)
            return true
        }
        catch(e) {
            return false
        }
    },
    message: 'The input must be a valid public key'
});

extend('address', {
    validate(address) {
        try {
            Address.createFromRawAddress(address)
            return true
        }
        catch(e) {
            return false
        }
    },
    message: 'The input must be a valid address'
});

extend('addressOrPublicKey', {
    validate(input) {
        try {
            Address.createFromRawAddress(input)
            return true
        }
        catch(e) {}

        try {
            PublicAccount.createFromPublicKey(input, NetworkType.MIJIN_TEST)
            return true
        }
        catch(e) {}

        return false
    },
    message: 'The input must be a valid address or public key'
});

extend('addressOrNamespace', {
    validate(input) {
        try {
            Address.createFromRawAddress(input)
            return true
        }
        catch(e) {}

        try {
            new NamespaceId(input) // throws on zero length..
            return true
        }
        catch(e) {}

        return false
    },
    message: 'The public key must be valid'
});

extend('addressOrPublicKeyOrNamespace', {
    validate(input) {
        try {
            Address.createFromRawAddress(input)
            return true
        }
        catch(e) {}

        try {
            PublicAccount.createFromPublicKey(input, NetworkType.MIJIN_TEST)
            return true
        }
        catch(e) {}

        try {
            new NamespaceId(input) // throws on zero length..
            return true
        }
        catch(e) {}

        return false
    },
    message: 'The input must be a valid address or public key'
});


extend('supply', {
    validate(supply) {
        return supply <= NETWORK_PARAMS.MAX_MOSAIC_ATOMIC_UNITS
    },
    message: 'The supply cannot exceed ' + NETWORK_PARAMS.MAX_MOSAIC_ATOMIC_UNITS
});

extend('divisibility', {
    validate(supply) {
        return supply <= NETWORK_PARAMS.MAX_MOSAIC_DIVISIBILITY
    },
    message: 'The divisibility cannot exceed ' + NETWORK_PARAMS.MAX_MOSAIC_DIVISIBILITY
});
