import { config } from 'dotenv'
import { createWalletClient, http } from 'viem';
import { mnemonicToAccount } from 'viem/accounts'
import { getWalletClient } from 'wagmi/actions';
import { base } from 'viem/chains';
import { generateSessionKey } from './utils';
import { Client } from 'yellow-ts'
import { createAuthRequestMessage, RPCMethod, RPCResponse, createEIP712AuthMessageSigner, AuthChallengeRequest, createAuthVerifyMessage, AuthChallengeResponse } from '@erc7824/nitrolite';

config()

export async function main() {

    const wallet = mnemonicToAccount(process.env.SEED_PHRASE as string);

    const walletClient = createWalletClient({
        account: wallet,
        chain: base,
        transport: http()
    })

    const sessionKey = generateSessionKey();

    const yellow = new Client({
        url: 'wss://clearnet.yellow.com/ws'
    })

    await yellow.connect()

    console.log('Yellow Connected!');

    const sessionExpireTimestamp = BigInt(Math.floor(Date.now() / 1000) + 3600)


     const authMessage = await createAuthRequestMessage ({
        address: wallet.address,
        session_key: sessionKey.address,
        application: wallet.address,
        allowances: [],
        expires_at: sessionExpireTimestamp,
        scope: 'test.app',
        

     })

     console.log('Auth message', authMessage);

     yellow.sendMessage(authMessage);
     
     yellow.listen(async(message: RPCResponse) => {

        switch (message.method) {

            case RPCMethod.AuthChallenge:
                console.log('Auth challenge', message.params);

                const authParams = {
                    scope: 'test.app',
                    application: wallet.address,
                    participant: sessionKey.address,
                    session_key: sessionKey.address,
                    expires_at: sessionExpireTimestamp,
                    allowances: [],

                }
                const eip712Singer = createEIP712AuthMessageSigner(walletClient, authParams, { name: authParams.application})

                const authVerifyMessage = await createAuthVerifyMessage(eip712Singer, message as AuthChallengeResponse)

                console.log('Auth verify message', authVerifyMessage);
                yellow.sendMessage(authVerifyMessage);

                break;

            case RPCMethod.AuthVerify:
                console.log('Auth verify', message.params);
                break;

                    default:
      
      console.log('Unhandled message:', JSON.stringify(message, null, 2));
      break;


        }
        

     }) 
    }
if (require.main === module) {
    main().catch(console.error);
}
