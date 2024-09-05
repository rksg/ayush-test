import moment from 'moment-timezone'

import { StepsForm }                                                        from '@acx-ui/components'
import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { ClusterHaFallbackScheduleTypeEnum, ClusterHaLoadDistributionEnum } from '@acx-ui/rc/utils'
import { render, screen }                                                   from '@acx-ui/test-utils'

import { HaDisplayForm } from './HaDisplayForm'

describe('InterfaceSettings - Summary > HaDisplayForm', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render correctly', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <HaDisplayForm
            fallbackEnable={false}
            loadDistribution={ClusterHaLoadDistributionEnum.RANDOM}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('Off')).toBeVisible()
    expect(screen.getByText('Random distribution')).toBeVisible()
  })

  it('should render fallback time string correctly when the fallback type is Daily', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <HaDisplayForm
            fallbackEnable={true}
            fallbackScheduleType={ClusterHaFallbackScheduleTypeEnum.DAILY}
            fallbackScheduleTime={moment('12:00', 'HH:mm').toDate()}
            loadDistribution={ClusterHaLoadDistributionEnum.RANDOM}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('On')).toBeVisible()
    expect(screen.getByText('Everyday at 12:00')).toBeVisible()
    expect(screen.getByText('Random distribution')).toBeVisible()
  })

  it('should render fallback time string correctly when the fallback type is Weekly', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <HaDisplayForm
            fallbackEnable={true}
            fallbackScheduleType={ClusterHaFallbackScheduleTypeEnum.WEEKLY}
            fallbackScheduleWeekday='MON'
            fallbackScheduleTime={moment('12:00', 'HH:mm').toDate()}
            loadDistribution={ClusterHaLoadDistributionEnum.RANDOM}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('On')).toBeVisible()
    expect(screen.getByText('Every Monday at 12:00')).toBeVisible()
    expect(screen.getByText('Random distribution')).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should render fallback time string correctly when the fallback type is Interval', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <HaDisplayForm
            fallbackEnable={true}
            fallbackScheduleType={ClusterHaFallbackScheduleTypeEnum.INTERVAL}
            fallbackScheduleIntervalHours='12'
            loadDistribution={ClusterHaLoadDistributionEnum.AP_GROUP}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('On')).toBeVisible()
    expect(screen.getByText('Every 12 hours')).toBeVisible()
    expect(screen.getByText('Per AP group distribution')).toBeVisible()
  })

  it('should not render fallback settings when FF is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <HaDisplayForm
            fallbackEnable={false}
            loadDistribution={ClusterHaLoadDistributionEnum.RANDOM}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.queryByText('SmartEdge Fallback')).not.toBeInTheDocument()
    expect(screen.getByText('Random distribution')).toBeVisible()
  })
})