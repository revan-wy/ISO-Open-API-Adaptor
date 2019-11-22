import Knex from 'knex'
import Axios, { AxiosInstance } from 'axios'
import { KnexQuotesService, DBQuote } from '../../src/services/quotes-service'
import { QuotesPostRequest } from '../../src/types/mojaloop'
import { QuotesPostRequestFactory } from '../factories/mojaloop-messages'

describe('Quotes service', function () {
  let knex: Knex
  let quotesService: KnexQuotesService
  const fakeHttpClient: AxiosInstance = Axios.create()
  fakeHttpClient.get = jest.fn()

  beforeAll(async () => {
    knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
        supportBigNumbers: true
      },
      useNullAsDefault: true
    })

    quotesService = new KnexQuotesService(knex, fakeHttpClient)
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

  test('can create a quote', async () => {
    const quoteRequest = QuotesPostRequestFactory.build()

    const quote = await quotesService.create(quoteRequest, 'testCondition')

    const dbQuote = await knex<DBQuote>('quotes').where('id', quoteRequest.quoteId).first()

    if (!dbQuote) {
      fail('dbQuote does not exist')
    }
    expect(dbQuote.id).toBe(quoteRequest.quoteId)
    expect(dbQuote.transactionId).toBe(quoteRequest.transactionId)
    expect(dbQuote.amount).toBe(quoteRequest.amount.amount)
    expect(dbQuote.amountCurrency).toBe(quoteRequest.amount.currency)
    expect(dbQuote.expiration).toBe(quoteRequest.expiration)
    expect(dbQuote.condition).toBe('testCondition')

    expect(quote.amount).toEqual(quoteRequest.amount)
    expect(quote.id).toEqual(quoteRequest.quoteId)
    expect(quote.transactionId).toEqual(quoteRequest.transactionId)
  })

})
