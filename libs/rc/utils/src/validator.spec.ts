import { useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { networkWifiIpRegExp, checkObjectNotExists } from './validator'

describe('validator', () => {
  describe('ipV4RegExp', () => {
    it('Should take care of ip address values correctly', async () => {
      const result = renderHook(() =>
        networkWifiIpRegExp(useIntl(), '111.111.111.111')).result.current
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error meesage if ip address values incorrectly', async () => {
      const result = renderHook(() =>
        networkWifiIpRegExp(useIntl(), '000.000.000.000')).result.current
      await expect(result).rejects.toEqual('Please enter a valid IP address')
    })
  })

  describe('checkObjectNotExists', () => {
    const mockdata = ['test01']
    it('Should not display error if object does not exist', async () => {
      const result = renderHook(() =>
        checkObjectNotExists(useIntl(), mockdata, 'test02', 'Network')).result.current
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should return false when object exists', async () => {
      const result1 = renderHook(() =>
        checkObjectNotExists(useIntl(), mockdata, 'test01', 'Network')).result.current
      await expect(result1).rejects.toEqual('Network with that name already exists')
      const result2 = renderHook(() =>
        checkObjectNotExists(useIntl(), mockdata, 'test01', 'Network', 'pname')).result.current
      await expect(result2).rejects.toEqual('Network with that value already exists')
    })
  })
})
