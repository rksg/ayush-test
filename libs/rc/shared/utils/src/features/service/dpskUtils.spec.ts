import { setUpIntl } from '@acx-ui/utils'

import { displayDefaultAccess, displayDeviceCountLimit, getPassphraseStatus } from './dpskUtils'

const mockedBaseDpskPassphrase = {
  id: '__PASSPHRASE_ID_3__',
  passphrase: 'JjCc87!!!!!',
  expirationDate: null,
  createdDate: '2022-12-22T14:20:00'
}

describe('DPSK utils', () => {
  beforeEach(() => {
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
  })
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

  it('display default access', () => {
    const acceptResult = displayDefaultAccess(true)
    expect(acceptResult).toBe('ACCEPT')

    const rejectResult = displayDefaultAccess(false)
    expect(rejectResult).toBe('REJECT')

    const undefinedResult = displayDefaultAccess(undefined)
    expect(undefinedResult).toBe('ACCEPT')
  })
})
