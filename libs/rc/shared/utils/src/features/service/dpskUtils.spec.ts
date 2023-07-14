import { displayDeviceCountLimit, getPassphraseStatus, isActivePassphrase } from './dpskUtils'

const mockedBaseDpskPassphrase = {
  id: '__PASSPHRASE_ID_3__',
  passphrase: 'JjCc87!!!!!',
  expirationDate: null,
  createdDate: '2022-12-22T14:20:00'
}

describe('DPSK utils', () => {
  it('display device count limit', () => {
    const numberResult = displayDeviceCountLimit(1)
    expect(numberResult).toBe(1)

    const unlimitedResult = displayDeviceCountLimit(undefined)
    expect(unlimitedResult).toBe('Unlimited')
  })

  it('get passphrase status', () => {
    const revoked = getPassphraseStatus({
      ...mockedBaseDpskPassphrase,
      revocationDate: '2022-12-24T08:00:00.000+0000'
    }, true)
    expect(revoked).toBe('Revoked (2022-12-24 08:00 AM)')

    const expired = getPassphraseStatus({
      ...mockedBaseDpskPassphrase,
      expirationDate: '2022-12-25T08:39:00'
    }, true)
    expect(expired).toBe('Expired')

    const active = getPassphraseStatus({
      ...mockedBaseDpskPassphrase
    }, true)
    expect(active).toBe('Active')
  })

  it('check is active passphrase', () => {
    const revoked = isActivePassphrase({
      ...mockedBaseDpskPassphrase,
      revocationDate: '2022-12-24T08:00:00.000+0000'
    }, true)
    expect(revoked).toBe(false)

    const active = isActivePassphrase({
      ...mockedBaseDpskPassphrase
    }, true)
    expect(active).toBe(true)
  })
})
