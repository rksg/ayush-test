import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { FirmwareCategory,
  FirmwareRbacUrlsInfo,
  FirmwareSwitchV1002,
  FirmwareSwitchVenueV1002,
  FirmwareVersion,
  SwitchFirmwareFixtures,
  SwitchFirmwareVersion1002,
  defaultSort } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { mockServer, renderHook } from '@acx-ui/test-utils'

import { availableVersionsV1002, defaultVersionsV1002, mockSwitchVenue, mockVenue } from './__tests__/fixtures'

import { useSwitchFirmwareUtils } from '.'

const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

jest.mock('@acx-ui/rc/services', () => ({
  useGetSwitchDefaultVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  }),
  useGetSwitchCurrentVersionsQuery: () => ({
    data: mockSwitchCurrentVersionsV1002
  })
}))

describe('Test useSwitchFirmwareUtils', () => {

  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockServer.use(
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      )
    )
  })
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

describe('isDowngradeVersion function', () => {
  it('should return false if inUseVersion includes "090" and version is equal', () => {
    const { result } = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { isDowngradeVersion } = result.current
    expect(isDowngradeVersion('09010h', '09010h', '10010a_b36')).toBe(false)
  })

  it('should return true if inUseVersion includes "090" and version is less', () => {
    const { result } = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { isDowngradeVersion } = result.current
    expect(isDowngradeVersion('09010h', '09010h_cd1', '10010a_b36')).toBe(true)
  })

  it('should return false if inUseVersion includes "090" and version is greater', () => {
    const { result } = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { isDowngradeVersion } = result.current
    expect(isDowngradeVersion('09010i', '09010h', '10010a_b36')).toBe(false)
  })

  it('should return false if inUseVersion includes "100" and version is equal', () => {
    const { result } = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { isDowngradeVersion } = result.current
    expect(isDowngradeVersion('10010a_b36', '09010h', '10010a_b36')).toBe(false)
  })

  it('should return true if inUseVersion includes "100" and version is less', () => {
    const { result } = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { isDowngradeVersion } = result.current
    expect(isDowngradeVersion('10010h', '09010h_cd1', '10010i')).toBe(true)
  })

  it('should return false if inUseVersion includes "100" and version is greater', () => {
    const { result } = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { isDowngradeVersion } = result.current
    expect(isDowngradeVersion('10010i', '09010h_cd1', '10010h')).toBe(false)
  })

})

describe('checkCurrentVersionsV1002', () => {
  const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

  it('should checkCurrentVersionsV1002 function', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      )
    )

    const utils = renderHook(() => useSwitchFirmwareUtils(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { checkCurrentVersionsV1002 } = utils.result.current

    const selectedVersion = {
      venueId: 'a1f2bf4f969849d5a1ecfdfdb0664fac',
      venueName: 'ccc',
      versions: [
        {
          modelGroup: 'ICX7X',
          version: '10010_rc3'
        },
        {
          modelGroup: 'ICX82',
          version: '10010_rc3'
        },
        {
          modelGroup: 'ICX71',
          version: '09010h_cd2_b4'
        }
      ],
      lastScheduleUpdateTime: '2024-07-09T03:59:38.071+00:00',
      preDownload: true,
      status: 'NONE',
      scheduleCount: 0
    } as FirmwareSwitchVenueV1002 | FirmwareSwitchV1002
    const availableVersions = availableVersionsV1002 as SwitchFirmwareVersion1002[]
    const defaultVersions = defaultVersionsV1002 as SwitchFirmwareVersion1002[]
    const { result } = renderHook(() =>
      checkCurrentVersionsV1002(selectedVersion, availableVersions, defaultVersions))

    expect(result).toStrictEqual({
      current: [
        {
          modelGroup: 'ICX7X',
          switchCount: 0,
          versions: [
            {
              category: 'REGULAR',
              createdDate: '2024-05-23T03:54:07.867+00:00',
              id: '10010_rc3',
              inUse: true,
              isDowngradeVersion: undefined,
              isDowngraded10to90: undefined,
              name: '10010_rc3'
            },
            {
              category: 'REGULAR',
              createdDate: '2024-05-22T07:21:52.693+00:00',
              id: '10010_rc2',
              inUse: undefined,
              isDowngradeVersion: true,
              isDowngraded10to90: undefined,
              name: '10010_rc2'
            },
            {
              category: 'REGULAR',
              createdDate: '2024-04-09T09:13:50.553+00:00',
              id: '09010f_b19',
              inUse: undefined,
              isDowngradeVersion: true,
              isDowngraded10to90: true,
              name: '09010f_b19'
            },
            {
              category: 'REGULAR',
              createdDate: '2024-04-09T09:13:46.772+00:00',
              id: '09010h_rc1',
              inUse: undefined,
              isDowngradeVersion: true,
              isDowngraded10to90: true,
              name: '09010h_rc1'
            }
          ]
        },
        {
          modelGroup: 'ICX82',
          switchCount: 0,
          versions: [
            {
              category: 'REGULAR',
              createdDate: '2024-05-23T03:54:07.867+00:00',
              id: '10010_rc3',
              inUse: true,
              isDowngradeVersion: undefined,
              isDowngraded10to90: undefined,
              name: '10010_rc3'
            },
            {
              category: 'REGULAR',
              createdDate: '2024-05-22T07:21:52.693+00:00',
              id: '10010_rc2',
              inUse: undefined,
              isDowngradeVersion: true,
              isDowngraded10to90: undefined,
              name: '10010_rc2'
            },
            {
              category: 'REGULAR',
              createdDate: '2024-04-09T09:12:47.128+00:00',
              id: '10010a_cd1_b3',
              inUse: undefined,
              isDowngradeVersion: undefined,
              isDowngraded10to90: undefined,
              name: '10010a_cd1_b3'
            }
          ]
        },
        {
          modelGroup: 'ICX71',
          switchCount: 0,
          versions: [
            {
              category: 'REGULAR',
              createdDate: '2024-04-09T09:13:50.553+00:00',
              id: '09010f_b19',
              inUse: undefined,
              isDowngradeVersion: true,
              isDowngraded10to90: undefined,
              name: '09010f_b19'
            },
            {
              category: 'REGULAR',
              createdDate: '2024-04-09T09:13:46.772+00:00',
              id: '09010h_rc1',
              inUse: undefined,
              isDowngradeVersion: true,
              isDowngraded10to90: undefined,
              name: '09010h_rc1'
            },
            {
              category: 'RECOMMENDED',
              createdDate: '2024-04-09T09:13:06.337+00:00',
              id: '09010h_cd2_b4',
              inUse: true,
              isDowngradeVersion: undefined,
              isDowngraded10to90: undefined,
              name: '09010h_cd2_b4'
            }
          ]
        }
      ]
    })
  })
})

