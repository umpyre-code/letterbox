import * as crypto from 'crypto'
import { BloomFilter, fnv_1a, popcnt } from './BloomFilter'

test('adds entries to the bloomfilter and tests them', () => {
  const bf = new BloomFilter()

  bf.add('entry')
  bf.add('hello')
  expect(bf.test('entry')).toBe(true)
  expect(bf.test('hello')).toBe(true)
})

test('creates an empty bloomfilter and tests some values', () => {
  const bf = new BloomFilter()
  expect(bf.test('entry')).toBe(false)
  expect(bf.test('hello')).toBe(false)
})

test('adds random values to the bloomfilter and tests they are present', () => {
  const bf = new BloomFilter()

  const array = []
  for (let i = 0; i < 100; i++) {
    array.push(crypto.randomBytes(4).readUInt32BE(0))
  }

  array.forEach(value => bf.add(value.toString()))

  array.forEach(value => {
    expect(bf.test(value.toString())).toBe(true)
  })
})

test("generates random values and tests they aren't present in the bloomfilter", () => {
  const bf = new BloomFilter()

  const array = []
  for (let i = 0; i < 100; i++) {
    array.push(crypto.randomBytes(4).readUInt32BE(0))
  }

  array.forEach(value => {
    expect(bf.test(value.toString())).toBe(false)
  })
})

test('generates sequential numbers and tests for presence in bloomfilter', () => {
  const bf = new BloomFilter()

  const present = []
  const notPresent = []
  for (let i = 0; i < 100; i++) {
    present.push(i)
    notPresent.push(i + 10000)
  }

  present.forEach(value => bf.add(value.toString()))

  present.forEach(value => expect(bf.test(value.toString())).toBe(true))
  notPresent.forEach(value => expect(bf.test(value.toString())).toBe(false))
})

test('popcnt with known values has expected results', () => {
  expect(popcnt(0)).toBe(0)
  expect(popcnt(1)).toBe(1)
  expect(popcnt(2)).toBe(1)
  expect(popcnt(4)).toBe(1)
  expect(popcnt(8)).toBe(1)
  expect(popcnt(16)).toBe(1)
  expect(popcnt(0x55555555)).toBe(16)
  expect(popcnt(0x00ff00ff)).toBe(16)
  expect(popcnt(0x0000ffff)).toBe(16)
})

// From https://2ality.com/2012/02/js-integers.html
function toInteger(x: number) {
  x = Number(x)
  return x < 0 ? Math.ceil(x) : Math.floor(x)
}

function modulo(a: number, b: number) {
  return a - Math.floor(a / b) * b
}
function toUint32(x: number) {
  return modulo(toInteger(x), Math.pow(2, 32))
}

test('fnv_1a with known values has expected results', () => {
  expect(fnv_1a('lyle')).toBe(1334908444)
  expect(fnv_1a('lyle', 123)).toBe(1631759920)

  expect(toUint32(fnv_1a('1/fT/HwFDKYio/n/ZzxTXHpy8U0vzogzJhv+gculEhI'))).toBe(2344490131)
  expect(toUint32(fnv_1a('5Y6kvOWSehVNYBbkFkWjvcyEV584Hr61oN5z5ZDhKsI'))).toBe(3296761108)
  expect(toUint32(fnv_1a('b1wsxEazqgDI6ZMXfg3FN/5vOFElRkI340FQ7Mjh13s'))).toBe(709866909)
  expect(toUint32(fnv_1a('bpcfrG1CJ31wrdEJcOxPmXa41+PjkEbdvUrJ2VyGFWA'))).toBe(2024372548)
  expect(toUint32(fnv_1a('JmrQQJ/cYfehndWIxwYXrbV4upKEAF0kGoDmn6+BBRg'))).toBe(1830223429)
  expect(toUint32(fnv_1a('OzLSeTgwfpp7Mq4kDZKGpqgSuR8ZkzQb5F8kSC9q4W8'))).toBe(32938565)
  expect(toUint32(fnv_1a('R8x1axhFobtSMkUi1nUkkugT1CfPLYMP32PNMNpB148'))).toBe(869529502)
  expect(toUint32(fnv_1a('OzLSeTgwfpp7Mq4kDZKGpqgSuR8ZkzQb5F8kSC9q4W8'))).toBe(32938565)
  expect(toUint32(fnv_1a('ZI36t/aBiqlHlNp790hdEzEQYgYIkZZn0osEjsJK5oU'))).toBe(1559313349)

  expect(toUint32(fnv_1a('1/fT/HwFDKYio/n/ZzxTXHpy8U0vzogzJhv+gculEhI', 2344490131))).toBe(
    2482345007
  )
  expect(toUint32(fnv_1a('5Y6kvOWSehVNYBbkFkWjvcyEV584Hr61oN5z5ZDhKsI', 3296761108))).toBe(
    3727186510
  )
  expect(toUint32(fnv_1a('b1wsxEazqgDI6ZMXfg3FN/5vOFElRkI340FQ7Mjh13s', 709866909))).toBe(
    2119017804
  )
  expect(toUint32(fnv_1a('bpcfrG1CJ31wrdEJcOxPmXa41+PjkEbdvUrJ2VyGFWA', 2024372548))).toBe(
    2524436491
  )
  expect(toUint32(fnv_1a('JmrQQJ/cYfehndWIxwYXrbV4upKEAF0kGoDmn6+BBRg', 1830223429))).toBe(
    1366223816
  )
  expect(toUint32(fnv_1a('OzLSeTgwfpp7Mq4kDZKGpqgSuR8ZkzQb5F8kSC9q4W8', 32938565))).toBe(3503597509)
  expect(toUint32(fnv_1a('R8x1axhFobtSMkUi1nUkkugT1CfPLYMP32PNMNpB148', 869529502))).toBe(
    1351347067
  )
  expect(toUint32(fnv_1a('OzLSeTgwfpp7Mq4kDZKGpqgSuR8ZkzQb5F8kSC9q4W8', 32938565))).toBe(3503597509)
  expect(toUint32(fnv_1a('ZI36t/aBiqlHlNp790hdEzEQYgYIkZZn0osEjsJK5oU', 1559313349))).toBe(
    2819523972
  )
})
