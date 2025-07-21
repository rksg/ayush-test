import { fireEvent, render, screen } from '@acx-ui/test-utils'
import { UseQueryResult }            from '@acx-ui/types'

import { useUpdateSlaThresholdsMutation } from '../../services'
import { SLAKeys }                        from '../../types'

import { slaConfig } from './constants'
import { SLAData }   from './types'

import SLA from '.'

const mockDataWithDefaultAndUnsynced: SLAData = {
  [SLAKeys.timeToConnectSLA]: {
    value: 5,
    isSynced: false
  },
  [SLAKeys.clientThroughputSLA]: {
    value: slaConfig[SLAKeys.clientThroughputSLA].defaultValue!,
    isSynced: true,
    isDefault: true
  },
  [SLAKeys.channelWidthSLA]: {
    value: 20,
    isSynced: true
  },
  [SLAKeys.channelChangeExperienceSLA]: {
    value: slaConfig[SLAKeys.channelChangeExperienceSLA].defaultValue!,
    isSynced: true,
    isDefault: true
  }
}

const syncedMockData: SLAData = {
  [SLAKeys.timeToConnectSLA]: {
    value: 5,
    isSynced: true
  },
  [SLAKeys.clientThroughputSLA]: {
    value: slaConfig[SLAKeys.clientThroughputSLA].defaultValue!,
    isSynced: true
  },
  [SLAKeys.channelWidthSLA]: {
    value: 20,
    isSynced: true
  },
  [SLAKeys.channelChangeExperienceSLA]: {
    value: slaConfig[SLAKeys.channelChangeExperienceSLA].defaultValue!,
    isSynced: true
  }
}

jest.mock('../../services', () => ({
  useSlaThresholdsQuery: jest
    .fn()
    .mockReturnValue({ isLoading: false, isFetching: false }),
  useUpdateSlaThresholdsMutation: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false, isFetching: false }])
}))

describe('SLA', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('should render widget with correct sliders', () => {
    it('has 4 sliders', () => {
      render(
        <SLA
          mspEcIds={[]}
          queryResults={
            { data: mockDataWithDefaultAndUnsynced } as UseQueryResult<SLAData>
          }
        />
      )

      expect(screen.getByText('Service Level Agreement')).toBeVisible()
      expect(screen.getByText('Time to Connect (seconds)')).toBeVisible()
      expect(screen.getByText('Throughput Wi-Fi (Mbps)')).toBeVisible()
      expect(screen.getByText('Channel Width (Mbps)')).toBeVisible()
      expect(screen.getByText('Channel Change Per Day')).toBeVisible()
      expect(screen.getByText('Apply')).toBeVisible()
      expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
      expect(screen.getByText('Reset')).toBeVisible()
    })

    it('has 1 slider', () => {
      render(
        <SLA
          mspEcIds={[]}
          queryResults={
            {
              data: {
                [SLAKeys.channelChangeExperienceSLA]:
                  mockDataWithDefaultAndUnsynced.channelChangePerDaySLA
              }
            } as UseQueryResult<SLAData>
          }
        />
      )

      expect(screen.getByText('Service Level Agreement')).toBeVisible()
      expect(screen.getByText('Channel Change Per Day')).toBeVisible()
      expect(screen.getByText('Apply')).toBeVisible()
      expect(screen.getByText('Reset')).toBeVisible()
    })
  })

  it('should show disabled apply and reset when all kpis are synced', () => {
    render(
      <SLA
        mspEcIds={[]}
        queryResults={
          {
            data: syncedMockData
          } as UseQueryResult<SLAData>
        }
      />
    )

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  it('should show enabled apply when kpi using default values', () => {
    render(
      <SLA
        mspEcIds={[]}
        queryResults={
          { data: mockDataWithDefaultAndUnsynced } as UseQueryResult<SLAData>
        }
      />)

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  it('should enable apply and reset when kpi is update and call mutation on click', async () => {
    const mockUpdateMutation = jest.fn();
    (useUpdateSlaThresholdsMutation as jest.Mock).mockReturnValue([
      mockUpdateMutation,
      { isLoading: false, isFetching: false }
    ])

    render(
      <SLA
        mspEcIds={[]}
        queryResults={
          {
            data: syncedMockData
          } as UseQueryResult<SLAData>
        }
      />
    )

    const sliderMarkText = screen.getByText('200') // clientThroughputSLA
    fireEvent.click(sliderMarkText)
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(mockUpdateMutation).toHaveBeenCalledWith({
      mspEcIds: [],
      slasToUpdate: expect.objectContaining({
        clientThroughputSLA: 200000
      })
    })
  })

  it('should only update the kpi that is changed', async () => {
    const mockUpdateMutation = jest.fn();
    (useUpdateSlaThresholdsMutation as jest.Mock).mockReturnValue([
      mockUpdateMutation,
      { isLoading: false, isFetching: false }
    ])

    render(
      <SLA
        mspEcIds={[]}
        queryResults={
          {
            data: syncedMockData
          } as UseQueryResult<SLAData>
        }
      />
    )

    const sliderMarkText = screen.getByText('200') // clientThroughputSLA
    fireEvent.click(sliderMarkText)
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(mockUpdateMutation).toHaveBeenCalledWith({
      mspEcIds: [],
      slasToUpdate: expect.objectContaining({
        clientThroughputSLA: 200000
      })
    })
  })

  it('should reset kpi correctly', () => {
    render(
      <SLA
        mspEcIds={[]}
        queryResults={
          {
            data: syncedMockData
          } as UseQueryResult<SLAData>
        }
      />
    )

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()

    const sliderMarkText = screen.getByText('200')
    fireEvent.click(sliderMarkText)

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(sliderMarkText.closest('.ant-slider-mark-text')).not.toHaveClass(
      'ant-slider-mark-text-active'
    )
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
  })

  it('should not show sla when splits and default value are not populated', () => {
    render(
      <SLA
        mspEcIds={[]}
        queryResults={
          {
            data: {
              [SLAKeys.connectionSuccessSLA]: {
                value: 5,
                isSynced: false
              }
            }
          } as UseQueryResult<SLAData>
        }
      />
    )

    expect(screen.queryByText('Connection Success')).not.toBeInTheDocument()
  })

  it('should show no data when data is null', () => {
    render(
      <SLA
        mspEcIds={[]}
        queryResults={
          {
            data: null
          } as unknown as UseQueryResult<SLAData>
        }
      />
    )

    expect(screen.getByText('Service Level Agreement')).toBeVisible()
    expect(screen.queryByText('No data to display')).toBeVisible()
  })
})
