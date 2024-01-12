import { useIntl } from 'react-intl'

import { FirmwareCategory, FirmwareVersion, defaultSort } from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { renderHook }                                     from '@acx-ui/test-utils'

import { mockSwitchVenue, mockVenue } from './__tests__/fixtures'

import { useSwitchFirmwareUtils } from '.'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchCurrentVersionsQuery: () => ({
    data: {
      currentVersions: [
        '09010e_b392',
        '09010f_b19'
      ],
      currentVersionsAboveTen: [
        '10010_b176',
        '10010_rc3'
      ],
      generalVersions: [
        '09010f_b19',
        '09010e_b392',
        '10010_rc3',
        '10010a_b36',
        '09010h_rc1',
        '09010h_cd1_b3',
        '10010a_cd3_b11',
        '09010h_cd2_b4',
        '10010b_rc88',
        '10010c_rc168'
      ]
    }
  })
}))

describe('Test useSwitchFirmwareUtils', () => {
  it('parseSwitchVersion', async () => {
    const { result } = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { parseSwitchVersion } = result.current
    expect(parseSwitchVersion('09010h')).toBe('9.0.10h')
    expect(parseSwitchVersion('09010f_b19')).toBe('9.0.10f')
  })

  it('getSwitchVersionLabel', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { getSwitchVersionLabel } = utils.result.current
    const firmwareVersion = {
      id: '09010h',
      name: '09010h',
      inUse: false,
      category: FirmwareCategory.RECOMMENDED
    } as FirmwareVersion

    const { result } = renderHook(() =>
      getSwitchVersionLabel(useIntl(), firmwareVersion))
    expect(result).toEqual({ current: '9.0.10h (Release - Recommended)' })
  })

  it('getSwitchVersionLabel - inUse is true', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { getSwitchVersionLabel } = utils.result.current
    const firmwareVersion = {
      id: '09010h',
      name: '09010h',
      inUse: true,
      category: FirmwareCategory.RECOMMENDED
    } as FirmwareVersion

    const { result } = renderHook(() =>
      getSwitchVersionLabel(useIntl(), firmwareVersion))
    // eslint-disable-next-line max-len
    expect(result).toEqual({ current: '9.0.10h (Release - Recommended) - Selected Venues are already on this release' })
  })

  it('getSwitchNextScheduleTplTooltip', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { getSwitchNextScheduleTplTooltip } = utils.result.current

    const { result } = renderHook(() =>
      getSwitchNextScheduleTplTooltip(mockVenue))
    expect(result).toEqual({ current: '9.0.10h_cd2, 10.0.10a_cd3' })
  })

  it('getSwitchScheduleTpl', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { getSwitchScheduleTpl } = utils.result.current

    const { result } = renderHook(() =>
      getSwitchScheduleTpl(mockSwitchVenue))
    expect(result).toEqual({ current: '9.0.10f, 10.0.10a_cd3' })
  })

  it('getSwitchFirmwareList', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { getSwitchFirmwareList } = utils.result.current

    const { result } = renderHook(() =>
      getSwitchFirmwareList(mockVenue))
    expect(result).toEqual({ current: ['9.0.10e', '10.0.10'] })
  })

  it('getSwitchVenueAvailableVersions', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { getSwitchVenueAvailableVersions } = utils.result.current

    const { result } = renderHook(() =>
      getSwitchVenueAvailableVersions(mockVenue))
    expect(result).toEqual({ current: '9.0.10h_cd2,10.0.10a_cd3' })
  })

  it('sortAvailableVersionProp', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { sortAvailableVersionProp } = utils.result.current

    const { result } = renderHook(() =>
      sortAvailableVersionProp(defaultSort)(mockVenue, mockVenue))
    expect(result).toEqual({ current: 0 })
  })


  it('checkCurrentVersions', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { checkCurrentVersions } = utils.result.current
    const firmwareVersion = {
      id: '09010h',
      name: '09010h',
      inUse: false,
      category: FirmwareCategory.RECOMMENDED
    } as FirmwareVersion

    const { result } = renderHook(() =>
      checkCurrentVersions('09010h', '10010a_b36', [firmwareVersion]))
    expect(result).toEqual({
      current: [{
        id: '09010h',
        name: '09010h',
        inUse: true,
        category: FirmwareCategory.RECOMMENDED
      }]
    })
  })

  it('checkCurrentVersions - default version', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { checkCurrentVersions } = utils.result.current
    const firmwareVersion = {
      id: '09010f_b19',
      name: '09010f_b19',
      inUse: false,
      category: FirmwareCategory.RECOMMENDED
    } as FirmwareVersion

    const { result } = renderHook(() =>
      checkCurrentVersions('09010f_b19', '10010_rc3', [firmwareVersion]))
    expect(result).toEqual({
      current: [{
        id: '09010f_b19',
        name: '09010f_b19',
        inUse: true,
        category: FirmwareCategory.RECOMMENDED
      }]
    })
  })

  it('checkCurrentVersions - rodan version', async () => {
    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { checkCurrentVersions } = utils.result.current
    const firmwareVersion = {
      id: '10010a_b36',
      name: '10010a_b36',
      inUse: false,
      category: FirmwareCategory.RECOMMENDED
    } as FirmwareVersion

    const { result } = renderHook(() =>
      checkCurrentVersions('09010f_b19', '10010a_b36', [firmwareVersion]))
    expect(result).toEqual({
      current: [{
        id: '10010a_b36',
        name: '10010a_b36',
        inUse: true,
        category: FirmwareCategory.RECOMMENDED
      }]
    })
  })
})
