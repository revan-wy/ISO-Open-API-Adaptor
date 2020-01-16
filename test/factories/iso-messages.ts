import { Factory } from 'rosie'
import Faker from 'faker'
import { ISO0100, ISO0110, ISO0200 } from '../../src/types/iso-messages'
import { pad } from '../../src/utils/util'

function generateField7 (): string {
  const now = new Date(Date.now())
  const month = (now.getUTCMonth() + 1).toString()
  const day = now.getUTCDate().toString()
  const minutes = now.getUTCMinutes().toString()
  const hours = now.getUTCHours().toString()
  const seconds = now.getUTCSeconds().toString()

  return pad(month, 2, '0') + pad(day, 2, '0') + pad(hours, 2, '0') + pad(minutes, 2, '0') + pad(seconds, 2, '0')
}

export const ISO0100Factory = Factory.define <Partial<ISO0100>>('Iso0100Factory').attrs({
  0: '0100',
  3: '012000',
  4: '000000010000',
  49: '820',
  7: generateField7(),
  37: Faker.internet.password(12, false, /[0-9a-z]/),
  41: Faker.internet.password(8, false, /[0-9a-z]/),
  42: Faker.internet.password(15, false, /[0-9a-z]/),
  102: () => '26' + Faker.internet.password(26, false, /[0-9]/),
  28: 'C00000001',
  103: () => '04' + Faker.internet.password(6, false, /[0-9]/),
  11: Faker.internet.password(6, false, /[0-9]/),
  127.2: '000319562' // Postillion switchKey
})

export const ISO0110Factory = Factory.define<Partial<ISO0110>>('Iso0110Factory').attrs({
  0: '0110',
  3: '012000',
  4: '000000010000',
  7: generateField7(),
  11: Faker.internet.password(6, false, /[0-9]/),
  12: '151932',
  28: 'C00000001',
  30: 'C00000001',
  39: '00',
  41: Faker.internet.password(8, false, /[0-9a-z]/),
  42: Faker.internet.password(15, false, /[0-9a-z]/),
  48: '012000',
  49: '820',
  102: () => '26' + Faker.internet.password(26, false, /[0-9]/),
  127.2: '000319562' // Postillion switchKey
})

export const ISO0200Factory = Factory.define <Partial<ISO0200>>('Iso0200Factory').attrs({
  0: '0200',
  3: '012000',
  4: '000000010000',
  49: '820',
  7: generateField7(),
  37: Faker.internet.password(12, false, /[0-9a-z]/),
  41: Faker.internet.password(8, false, /[0-9a-z]/),
  42: Faker.internet.password(15, false, /[0-9a-z]/),
  102: () => '26' + Faker.internet.password(26, false, /[0-9]/),
  28: 'C00000001',
  103: () => '04' + Faker.internet.password(6, false, /[0-9]/),
  11: Faker.internet.password(6, false, /[0-9]/),
  127.2: '000319562' // Postillion switchKey
})

export const iso0100BinaryMessage = Buffer.from([0x01,0xD0,0x30,0x31,0x30,0x30,0xfa,0xb9,0x44,0xd8,0x00,0xe0,0xcc,0x20,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x22,0x31,0x37,0x31,0x39,0x35,0x36,0x32,0x39,0x36,0x34,0x33,0x39,0x34,0x30,0x30,0x30,0x30,0x30,0x33,0x33,0x39,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x34,0x30,0x30,0x30,0x30,0x31,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x31,0x32,0x32,0x31,0x30,0x32,0x39,0x35,0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x30,0x30,0x30,0x30,0x30,0x35,0x31,0x35,0x35,0x39,0x35,0x30,0x30,0x31,0x32,0x32,0x31,0x31,0x31,0x35,0x36,0x30,0x31,0x31,0x39,0x30,0x31,0x30,0x30,0x33,0x31,0x44,0x30,0x30,0x30,0x30,0x30,0x34,0x30,0x30,0x43,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x33,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x31,0x47,0x69,0x72,0x61,0x66,0x66,0x65,0x20,0x52,0x6f,0x61,0x64,0x20,0x31,0x39,0x20,0x4d,0x6f,0x6e,0x75,0x6d,0x65,0x6e,0x74,0x20,0x50,0x61,0x72,0x6b,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x47,0x50,0x5a,0x41,0x38,0x34,0x30,0x38,0x34,0x30,0x31,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x32,0x30,0x30,0x30,0x34,0x30,0x33,0x35,0x36,0x43,0x30,0x30,0x30,0x30,0x30,0x30,0x31,0x30,0x30,0x30,0x30,0x30,0x30,0x33,0x31,0x42,0x46,0x41,0x30,0x37,0x42,0x31,0x35,0x2d,0x41,0x42,0x38,0x41,0x2d,0x34,0x32,0x45,0x44,0x2d,0x39,0x41,0x34,0x35,0x2d,0x43,0x35,0x33,0x32,0x32,0x39,0x33,0x30,0x31,0x35,0x32,0x31,0x31,0x32,0x30,0x31,0x32,0x31,0x33,0x31,0x34,0x34,0x30,0x30,0x32,0x30,0x30,0x30,0x30,0x38,0x35,0x40,0x1c,0x00,0x40,0x00,0x00,0x00,0x00,0x33,0x32,0x30,0x31,0x30,0x30,0x3a,0x30,0x30,0x30,0x30,0x30,0x35,0x3a,0x30,0x31,0x32,0x32,0x31,0x30,0x32,0x39,0x35,0x30,0x3a,0x33,0x39,0x34,0x30,0x30,0x30,0x30,0x30,0x33,0x30,0x35,0x54,0x45,0x53,0x54,0x31,0x31,0x31,0x32,0x32,0x32,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x35,0x36,0x46,0x45,0x44,0x20,0x20,0x20,0x20,0x20,0x30,0x39,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39])
export const iso0200BinaryMessage = Buffer.from([0x01, 0xD0,0x30,0x32,0x30,0x30,0xfa,0xb9,0x44,0xc8,0x00,0xe0,0xdc,0x20,0x00,0x00,0x00,0x00,0x06,0x00,0x00,0x22,0x31,0x37,0x31,0x39,0x35,0x36,0x32,0x39,0x36,0x34,0x33,0x39,0x34,0x30,0x30,0x30,0x30,0x30,0x33,0x30,0x31,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x34,0x30,0x30,0x30,0x30,0x31,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x31,0x32,0x32,0x31,0x30,0x32,0x39,0x35,0x32,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x30,0x30,0x30,0x30,0x30,0x36,0x31,0x35,0x35,0x39,0x35,0x32,0x30,0x31,0x32,0x32,0x31,0x31,0x31,0x35,0x36,0x30,0x31,0x31,0x39,0x30,0x31,0x30,0x30,0x33,0x31,0x43,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x33,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x31,0x47,0x69,0x72,0x61,0x66,0x66,0x65,0x20,0x52,0x6f,0x61,0x64,0x20,0x31,0x39,0x20,0x4d,0x6f,0x6e,0x75,0x6d,0x65,0x6e,0x74,0x20,0x50,0x61,0x72,0x6b,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x47,0x50,0x5a,0x41,0x38,0x34,0x30,0x38,0x34,0x30,0x41,0x34,0x36,0x38,0x33,0x36,0x39,0x44,0x31,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x32,0x30,0x30,0x30,0x34,0x30,0x33,0x35,0x36,0x43,0x30,0x30,0x30,0x30,0x30,0x30,0x31,0x30,0x30,0x30,0x30,0x30,0x30,0x33,0x31,0x46,0x32,0x43,0x30,0x30,0x39,0x36,0x41,0x2d,0x32,0x35,0x30,0x44,0x2d,0x34,0x42,0x32,0x38,0x2d,0x39,0x32,0x33,0x30,0x2d,0x32,0x36,0x37,0x38,0x38,0x45,0x34,0x31,0x31,0x31,0x39,0x35,0x36,0x32,0x39,0x36,0x34,0x33,0x39,0x34,0x30,0x34,0x31,0x32,0x33,0x34,0x30,0x31,0x35,0x32,0x31,0x31,0x32,0x30,0x31,0x32,0x31,0x33,0x31,0x34,0x34,0x30,0x30,0x32,0x30,0x30,0x30,0x30,0x38,0x35,0x40,0x1c,0x00,0x40,0x00,0x00,0x00,0x00,0x33,0x32,0x30,0x32,0x30,0x30,0x3a,0x30,0x30,0x30,0x30,0x30,0x36,0x3a,0x30,0x31,0x32,0x32,0x31,0x30,0x32,0x39,0x35,0x32,0x3a,0x33,0x39,0x34,0x30,0x30,0x30,0x30,0x30,0x33,0x30,0x35,0x54,0x45,0x53,0x54,0x31,0x31,0x31,0x32,0x32,0x32,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x35,0x36,0x46,0x45,0x44,0x20,0x20,0x20,0x20,0x20,0x30,0x39,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39])

