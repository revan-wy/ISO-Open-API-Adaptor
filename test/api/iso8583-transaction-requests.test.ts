import Knex from 'knex'
import { ISO0100Factory } from '../factories/iso-messages'
import { createApp } from '../../src/adaptor'
import { Server } from 'hapi'
import { AdaptorServicesFactory } from '../factories/adaptor-services'
import { KnexTransactionsService, TransactionState } from '../../src/services/transactions-service'
import Axios from 'axios'
import { KnexIsoMessageService } from '../../src/services/iso-message-service'
import { TransactionRequestFactory } from '../factories/transaction-requests'
import { generateTransactionType } from '../../src/controllers/iso8583-transaction-requests-controller'
const MLNumber = require('@mojaloop/ml-number')

jest.mock('uuid/v4', () => () => '123')

const LPS_KEY = 'postillion:0100'
const LPS_ID = 'postillion'

describe('Transaction Requests API', function () {

  let knex: Knex
  let adaptor: Server
  const services = AdaptorServicesFactory.build()
  const logger = console

  beforeAll(async () => {
    knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
        supportBigNumbers: true
      },
      useNullAsDefault: true
    })
    const httpClient = Axios.create()
    services.transactionsService = new KnexTransactionsService({ knex, client: httpClient, logger })
    services.transactionsService.sendToMojaHub = jest.fn().mockResolvedValue(undefined)
    services.isoMessagesService = new KnexIsoMessageService(knex)
    adaptor = await createApp(services)
  })

  beforeEach(async () => {
    await knex.migrate.latest()
  })

  afterEach(async () => {
    await knex.migrate.rollback()
  })

  afterAll(async () => {
    await knex.destroy()
  })

  test('stores the ISO0100 message', async () => {
    const iso0100 = ISO0100Factory.build()

    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: LPS_KEY, lpsId: LPS_ID, ...iso0100 }
    })

    expect(response.statusCode).toBe(202)
    const storedIso0100 = await knex('isoMessages').first()
    expect(storedIso0100.lpsId).toBe(LPS_ID)
    expect(storedIso0100.lpsKey).toBe(LPS_KEY)
    expect(JSON.parse(storedIso0100.content)).toMatchObject(iso0100)
  })

  test('creates a transaction request from the ISO0100 message', async () => {
    const iso0100 = ISO0100Factory.build({
      4: '000000080000', // transaction amount
      28: 'D00000500' // lps fee
    })

    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: LPS_KEY, lpsId: LPS_ID, ...iso0100 }
    })

    expect(response.statusCode).toEqual(202)
    const transaction = await services.transactionsService.get('123', 'transactionRequestId')
    expect(transaction).toMatchObject({
      transactionRequestId: '123',
      payer: {
        partyIdType: 'MSISDN',
        partyIdentifier: iso0100[102]
      },
      payee: {
        partyIdInfo: {
          partyIdType: 'DEVICE',
          partyIdentifier: iso0100[41],
          partySubIdOrType: iso0100[42]
        }
      },
      amount: {
        amount: '800',
        currency: 'USD' // TODO: lookup iso0100[49]
      },
      lpsFee: {
        amount: '5',
        currency: 'USD'
      },
      transactionType: {
        initiator: 'PAYEE',
        initiatorType: 'DEVICE',
        scenario: 'WITHDRAWAL'
      },
      authenticationType: 'OTP',
      expiration: iso0100[7],
      state: TransactionState.transactionReceived
    })
  })

  test('Requests an account lookup and uses the transactionRequestId as the traceId', async () => {
    const iso0100 = ISO0100Factory.build()

    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: LPS_KEY, lpsId: LPS_ID, ...iso0100 }
    })
    expect(response.statusCode).toEqual(202)
    expect(services.MojaClient.getParties).toHaveBeenCalledWith('MSISDN', iso0100[102], null)
  })

  test('check for incomplete transactions', async () => {
    const transaction = await services.transactionsService.create(TransactionRequestFactory.build())
    const iso0100 = ISO0100Factory.build()
    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: 'postillion:aef-123', lpsId: LPS_ID, ...iso0100 }
    })
    expect(response.statusCode).toEqual(202)

    const transactionIncomplete = await services.transactionsService.get(transaction.transactionRequestId, 'transactionRequestId')

    expect(transactionIncomplete.state).toBe(TransactionState.transactionCancelled)
  })

  test('assigns originator type DEVICE correctly', async () => {
    const iso0100ATM = ISO0100Factory.build()

    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: LPS_KEY, lpsId: LPS_ID, ...iso0100ATM }
    })

    expect(response.statusCode).toBe(202)
    const transaction = await services.transactionsService.get('123', 'transactionRequestId')
    expect(transaction.transactionType.initiatorType).toEqual('DEVICE')
  })

  test('assigns originator type AGENT correctly', async () => {
    const iso0100ATM = ISO0100Factory.build({ 123: '999999999901' })

    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: LPS_KEY, lpsId: LPS_ID, ...iso0100ATM }
    })

    expect(response.statusCode).toBe(202)
    const transaction = await services.transactionsService.get('123', 'transactionRequestId')
    expect(transaction.transactionType.initiatorType).toEqual('AGENT')
  })

  test('throws error on invalid processing code', async () => {
    expect(() => generateTransactionType('009000')).toThrow(Error)
  })

})
