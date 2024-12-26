import { screen }  from '@testing-library/react'
import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import { FirmwareUrlsInfo }                    from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { act, mockServer, render, renderHook } from '@acx-ui/test-utils'

import {
  mockedApModelFirmwares,
  mockedFirmwareVenuesPerApModel,
  preference
} from './__tests__/fixtures'
import {
  convertApModelFirmwaresToUpdateGroups,
  convertToApModelIndividualDisplayData,
  ExpandableApModelList,
  findExtremeFirmwareBasedOnApModel,
  renderCurrentFirmwaresColumn,
  useChangeScheduleVisiblePerApModel,
  useDowngradePerApModel,
  useUpdateNowPerApModel,
  useUpgradePerferences
} from './venueFirmwareListPerApModelUtils'

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: () => '',
    $t: jest.fn()
  })
}))

describe('venueFirmwareListPerApModelUtils parser', () => {

  it('should useUpdateNowPerApModel work', () => {
    const { result } = renderHook(useUpdateNowPerApModel)
    expect(result.current.updateNowVisible).toBeFalsy()

    act(() => {
      result.current.setUpdateNowVisible(true)
    })
    expect(result.current.updateNowVisible).toBeTruthy()

    act(() => {
      result.current.handleUpdateNowCancel()
    })
    expect(result.current.updateNowVisible).toBeFalsy()
  })

  it('should useChangeScheduleVisiblePerApModel work', () => {
    const { result } = renderHook(useChangeScheduleVisiblePerApModel)
    expect(result.current.changeScheduleVisible).toBeFalsy()

    act(() => {
      result.current.setChangeScheduleVisible(true)
    })
    expect(result.current.changeScheduleVisible).toBeTruthy()

    act(() => {
      result.current.handleChangeScheduleCancel()
    })
    expect(result.current.changeScheduleVisible).toBeFalsy()
  })

  it('should useDowngradePerApModel work', () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedApModelFirmwares))
      )
    )

    const { result } = renderHook(() => useDowngradePerApModel(), { wrapper: Provider })
    expect(result.current.downgradeVisible).toBeFalsy()

    act(() => {
      result.current.setDowngradeVisible(true)
    })
    expect(result.current.downgradeVisible).toBeTruthy()

    act(() => {
      result.current.handleDowngradeCancel()
    })
    expect(result.current.downgradeVisible).toBeFalsy()

    const selectedVenues = [{
      id: 'mock_venue_id',
      name: 'mock_venue_name',
      isApFirmwareUpToDate: true,
      currentApFirmwares: [{ apModel: 'R720', firmware: '6.0.0.0.0' }]
    }]

    expect(result.current.canDowngrade(selectedVenues)).toBeFalsy()

  })

  it('should useUpgradePerferences work', async () => {
    const updatePreferencesRequestSpy = jest.fn()

    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.put(
        FirmwareUrlsInfo.updateUpgradePreferences.url,
        (req, res, ctx) => {
          updatePreferencesRequestSpy()
          return res(ctx.status(200))
        }
      )
    )

    const { result } = renderHook(() => useUpgradePerferences(), { wrapper: Provider })
    expect(result.current.preferencesModalVisible).toBeFalsy()

    act(() => {
      result.current.setPreferencesModalVisible(true)
    })
    expect(result.current.preferencesModalVisible).toBeTruthy()

    act(() => {
      result.current.handlePreferencesModalCancel()
    })
    expect(result.current.preferencesModalVisible).toBeFalsy()

    await act(() => {
      const upgradePreferences = {
        days: ['day1'],
        times: ['time1']
      }
      result.current.handlePreferencesModalSubmit(upgradePreferences)
    })
    expect(updatePreferencesRequestSpy).toBeCalled()

  })

  it('should renderCurrentFirmwaresColumn work', async () => {
    const data = mockedFirmwareVenuesPerApModel.data[0].currentApFirmwares
    render(
      <Provider>
        {renderCurrentFirmwaresColumn(data, useIntl())}
      </Provider>
    )

    const displayText = '7.0.0.103.1240, 7.0.0.103.1000, 6.2.3.103.800, 6.2.0.103.533'
    expect(await screen.findByText(displayText)).toBeVisible()

  })

  it('should convertApModelFirmwaresToUpdateGroups work', () => {
    const updateGroups = convertApModelFirmwaresToUpdateGroups(mockedApModelFirmwares)
    expect(updateGroups).toEqual([
      {
        apModels: [ 'R550', 'R770', 'R750', 'R350' ],
        firmwares: [{
          category: 'RECOMMENDED',
          name: '7.0.0.104.1242',
          onboardDate: '2024-02-21T05:18:57.254+0000',
          releaseDate: '2024-02-27T07:27:53.405+00:00'
        }]
      }, {
        apModels: [ 'R720' ],
        firmwares: [{
          category: 'RECOMMENDED',
          name: '6.2.4.103.244',
          onboardDate: '2023-12-21T03:09:32.204+0000',
          releaseDate: '2023-12-25T07:19:26.919+00:00'
        }]
      }, {
        apModels: [ 'R500' ],
        firmwares: [ {
          category: 'RECOMMENDED',
          name: '6.2.0.103.554',
          onboardDate: '2023-11-14T10:36:14.119+0000',
          releaseDate: '2024-02-27T07:29:28.160+00:00'
        }]
      }
    ])
  })

  it('should render ExpandableApModelList with 5 apModels', async () => {
    const apModels = [ 'R550', 'R770', 'R750', 'R350', 'R720' ]
    render(
      <Provider>
        <ExpandableApModelList apModels={apModels}/>
      </Provider>
    )

    const displayText = 'R550, R770, R750...'
    expect(await screen.findByText(displayText)).toBeVisible()

  })

  it('should render ExpandableApModelList with 2 apModels', async () => {
    const apModels = [ 'R550', 'R770' ]
    render(
      <Provider>
        <ExpandableApModelList apModels={apModels}/>
      </Provider>
    )

    const displayText = 'R550, R770'
    expect(await screen.findByText(displayText)).toBeVisible()

  })

  it('should convertToApModelIndividualDisplayData work', () => {
    const result = convertToApModelIndividualDisplayData(
      mockedApModelFirmwares,
      mockedFirmwareVenuesPerApModel.data)

    const expectData = [
      {
        apModel: 'R550',
        versionOptions: [ {
          key: '7.0.0.104.1242',
          label: '7.0.0.104.1242 (Release - Recommended) - 02/27/2024',
          releaseDate: '2024-02-27T07:27:53.405+00:00'
        }],
        extremeFirmware: '7.0.0.104.1242',
        defaultVersion: '7.0.0.104.1242'
      },
      {
        apModel: 'R770',
        versionOptions: [{
          key: '7.0.0.104.1242',
          label: '7.0.0.104.1242 (Release - Recommended) - 02/27/2024',
          releaseDate: '2024-02-27T07:27:53.405+00:00'
        }, {
          key: '7.0.0.104.1240',
          label: '7.0.0.104.1240 (Release - Recommended) - 02/27/2024',
          releaseDate: '2024-02-27T07:55:30.500+00:00'
        }],
        extremeFirmware: '7.0.0.103.1240',
        defaultVersion: '7.0.0.104.1242'
      },
      {
        apModel: 'R750',
        versionOptions: [{
          key: '7.0.0.104.1242',
          label: '7.0.0.104.1242 (Release - Recommended) - 02/27/2024',
          releaseDate: '2024-02-27T07:27:53.405+00:00'
        }, {
          key: '7.0.0.104.1240',
          label: '7.0.0.104.1240 (Release - Recommended) - 02/27/2024',
          releaseDate: '2024-02-27T07:55:30.500+00:00'
        }],
        extremeFirmware: '7.0.0.103.1240',
        defaultVersion: '7.0.0.104.1242'
      },
      {
        apModel: 'R350',
        versionOptions: [{
          key: '7.0.0.104.1242',
          label: '7.0.0.104.1242 (Release - Recommended) - 02/27/2024',
          releaseDate: '2024-02-27T07:27:53.405+00:00'
        }],
        extremeFirmware: '7.0.0.104.1242',
        defaultVersion: '7.0.0.104.1242'
      },
      {
        apModel: 'R720',
        versionOptions: [{
          key: '6.2.4.103.244',
          label: '6.2.4.103.244 (Release - Recommended) - 12/25/2023',
          releaseDate: '2023-12-25T07:19:26.919+00:00'
        }],
        extremeFirmware: '6.2.3.103.800',
        defaultVersion: '6.2.4.103.244'
      },
      {
        apModel: 'R500',
        versionOptions: [{
          key: '6.2.0.103.554',
          label: '6.2.0.103.554 (Release - Recommended) - 02/27/2024',
          releaseDate: '2024-02-27T07:29:28.160+00:00'
        }, {
          key: '6.2.0.103.548',
          label: '6.2.0.103.548 (Release - Recommended) - 11/01/2023',
          releaseDate: '2023-11-01T08:59:36.189+00:00'
        }],
        extremeFirmware: '6.2.0.103.533',
        defaultVersion: '6.2.0.103.554'
      }
    ]

    expect(result).toEqual(expectData)
  })

  it('should findExtremeFirmwareBasedOnApModel work', () => {
    const result = findExtremeFirmwareBasedOnApModel(mockedFirmwareVenuesPerApModel.data)
    expect(result).toEqual({
      R770: { extremeFirmware: '7.0.0.103.1240', isAllTheSame: true },
      R750: { extremeFirmware: '7.0.0.103.1240', isAllTheSame: true },
      R350: { extremeFirmware: '7.0.0.104.1242', isAllTheSame: false },
      R550: { extremeFirmware: '7.0.0.104.1242', isAllTheSame: false },
      R720: { extremeFirmware: '6.2.3.103.800', isAllTheSame: true },
      R500: { extremeFirmware: '6.2.0.103.533', isAllTheSame: true }
    })

  })
})
