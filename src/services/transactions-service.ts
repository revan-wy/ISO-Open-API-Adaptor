import Knex from 'knex'
import { Party, PartyIdInfo, Money, TransactionType } from '../types/mojaloop'
import { AxiosInstance } from 'axios'
const logger = require('@mojaloop/central-services-logger')

export enum TransactionState {
  requested = 'REQUESTED',
  created = 'CREATED',
  quoted = 'QUOTED',
  authorised = 'AUTHORISED',
  pending = 'PENDING',
  completed = 'COMPLETED'
}

export type DBTransactionParty = {
  fspId: string;
  transactionRequestId: string;
  type: string;
  identifierType: string;
  identifierValue: string;
  subIdorType: string;
}

export type DBTransaction = {
  transactionRequestId: string;
  transactionId?: string;
  lpsId: string;
  lpsKey: string;
  lpsFeeAmount: string;
  lpsFeeCurrency: string;
  state: string;
  amount: string;
  currency: string;
  expiration: string;
}

export type TransactionRequest = {
  transactionRequestId: string; // UUID generated by the adaptor for the Mojaloop transactionRequest
  lpsId: string;
  lpsKey: string;
  payee: Party;
  payer: PartyIdInfo;
  lpsFee: Money;
  amount: Money;
  transactionType: TransactionType;
  authenticationType?: 'OTP' | 'QRCODE' | undefined;
  expiration?: string;
}

export type Transaction = {
  transactionRequestId: string; // UUID generated by the adaptor for the Mojaloop transactionRequest
  transactionId?: string; // UUID generated by the Payer FSP
  payee: Party;
  payer: PartyIdInfo;
  lpsId: string;
  lpsKey: string;
  lpsFee: Money;
  state: string;
  amount: Money;
  transactionType: TransactionType;
  authenticationType?: 'OTP' | 'QRCODE' | undefined;
  expiration?: string;
}

export type TransactactionParty = {
  fspId: string;
  transactionRequestId: string;
  type: string;
  identifier: string;
  subIDosType: string;
}
export interface TransactionsService {
  get (id: string, idType: 'transactionId' | 'transactionRequestId'): Promise<Transaction>;
  create (request: TransactionRequest): Promise<Transaction>;
  updatePayerFspId(id: string, idType: 'transactionId' | 'transactionRequestId', fspId: string): Promise<TransactionRequest>;
  updateTransactionId(id: string, idType: 'transactionId' | 'transactionRequestId', fspId: string): Promise<Transaction>;
  sendToMojaHub (request: TransactionRequest): Promise<void>;
}
export class KnexTransactionsService implements TransactionsService {
  constructor (private _knex: Knex, private _client: AxiosInstance) {
  }

  async get (id: string, idType: 'transactionId' | 'transactionRequestId'): Promise<Transaction> {
    const dbTransaction: DBTransaction | undefined = await this._knex<DBTransaction>('transactions').where(idType, id).first()
    if (!dbTransaction) {
      throw new Error('Error fetching transaction from database')
    }

    const dbPayee: DBTransactionParty | undefined = await this._knex<DBTransactionParty>('transactionParties').where('transactionRequestId', dbTransaction.transactionRequestId).where('type', 'payee').first()
    const dbPayer: DBTransactionParty | undefined = await this._knex<DBTransactionParty>('transactionParties').where('transactionRequestId', dbTransaction.transactionRequestId).where('type', 'payer').first()

    if (!dbPayee) {
      throw new Error('Error fetching transaction payee database')
    }
    if (!dbPayer) {
      throw new Error('Error fetching transaction party from database')
    }

    const transaction: Transaction = {
      transactionRequestId: dbTransaction.transactionRequestId,
      payer: {
        partyIdType: dbPayer.identifierType,
        partyIdentifier: dbPayer.identifierValue,
        fspId: dbPayer.fspId
      },
      payee: {
        partyIdInfo: {
          partyIdType: dbPayee.identifierType,
          partyIdentifier: dbPayee.identifierValue,
          partySubIdOrType: dbPayee.subIdorType,
          fspId: dbPayee.fspId
        }
      },
      transactionId: dbTransaction.transactionId,
      lpsId: dbTransaction.lpsId,
      lpsKey: dbTransaction.lpsKey,
      lpsFee: {
        amount: dbTransaction.lpsFeeAmount,
        currency: dbTransaction.lpsFeeCurrency
      },
      state: dbTransaction.state,
      amount: {
        amount: dbTransaction.amount,
        currency: dbTransaction.currency
      },
      transactionType: {
        initiator: 'PAYEE', // TODO: check that these can be hard coded.
        initiatorType: 'DEVICE',
        scenario: 'WITHDRAWAL'
      },
      authenticationType: 'OTP',
      expiration: dbTransaction.expiration.toString()
    }

    return transaction
  }

  async create (request: TransactionRequest): Promise<Transaction> {
    logger.debug('Transaction Requests Service: Creating transaction request ' + request.transactionRequestId)
    await this._knex<DBTransactionParty>('transactionParties').insert({
      transactionRequestId: request.transactionRequestId,
      type: 'payee',
      identifierType: request.payee.partyIdInfo.partyIdType,
      identifierValue: request.payee.partyIdInfo.partyIdentifier,
      fspId: request.payee.partyIdInfo.fspId,
      subIdorType: request.payee.partyIdInfo.partySubIdOrType

    }).then(result => result[0])

    await this._knex<DBTransactionParty>('transactionParties').insert({
      transactionRequestId: request.transactionRequestId,
      type: 'payer',
      identifierType: request.payer.partyIdType,
      identifierValue: request.payer.partyIdentifier,
      fspId: request.payer.fspId,
      subIdorType: request.payer.partySubIdOrType
    }).then(result => result[0])

    await this._knex<DBTransaction>('transactions').insert({
      transactionRequestId: request.transactionRequestId,
      lpsId: request.lpsId,
      lpsKey: request.lpsKey,
      lpsFeeAmount: request.lpsFee.amount,
      lpsFeeCurrency: request.lpsFee.currency,
      state: TransactionState.requested,
      amount: request.amount.amount,
      currency: request.amount.currency,
      expiration: request.expiration
    }).then(result => result[0])

    return this.get(request.transactionRequestId, 'transactionRequestId')
  }

  async updatePayerFspId (id: string, idType: 'transactionId' | 'transactionRequestId', fspId: string): Promise<Transaction> {
    const dbTransaction = await this.get(id, idType)
    await this._knex('transactionParties').where('transactionRequestId', dbTransaction.transactionRequestId).where('type', 'payer').first().update('fspId', fspId)

    return this.get(id, idType)
  }

  async updateTransactionId (id: string, idType: 'transactionId' | 'transactionRequestId', transactionId: string): Promise<Transaction> {
    await this._knex('transactions').where(idType, id).first().update('transactionId', transactionId)

    return this.get(id, idType)
  }

  async sendToMojaHub (request: TransactionRequest): Promise<void> {
    await this._client.post('/transactionRequests', request)
  }
}
