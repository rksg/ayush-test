import { useMemo } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  ContentSwitcher,
  ContentSwitcherProps,
  HistoricalCard,
  Loader,
  NoData
} from '@acx-ui/components'

import { ContentSwitcherWrapper } from '../../styledComponents'
import { Mdu360TabProps }         from '../../types'

import {
  FranchisorTimeseries,
  useClientExperienceTimeseriesQuery
} from './services'
import Sparkline                                               from './Sparkline'
import StarRating                                              from './StarRating'
import { StarRatingContainer, SparklineContainer }             from './styledComponents'
import { getConfig, getPercentage, getSparklineData, SLAKeys } from './utils'

interface SLA {
  // starRating
  starRatingTitle: string
  percentage: number
  // sparkline
  sparklineTitle: string
  percentageText: string
  data: number[]
  shortText?: string
}

const config = getConfig()

const starRatingSLAKeys: SLAKeys[] = [
  SLAKeys.connectionSuccessSLA,
  SLAKeys.clientThroughputSLA,
  SLAKeys.timeToConnectSLA
]
const sparklineSLAKeys: SLAKeys[] = [
  SLAKeys.connectionSuccessSLA,
  SLAKeys.timeToConnectSLA,
  SLAKeys.clientThroughputSLA
]

type SlaMap = Record<SLAKeys, SLA>

const getSlaMap = (data: FranchisorTimeseries | undefined): SlaMap => {
  if (!data) return {} as SlaMap

  const sla: Record<SLAKeys, SLA> = {} as SlaMap

  const { errors, time, ...slaData } = data
  Object.entries(slaData).forEach(([key, value]) => {
    const slaKey = key as SLAKeys
    const percentage = getPercentage(value)
    if (percentage.percentage) {
      const {
        starRatingTitle,
        sparklineTitle,
        shortText
      } = config[slaKey]
      sla[slaKey] = ({
        ...percentage,
        shortText: shortText,
        starRatingTitle,
        sparklineTitle,
        data: value
      })
    }
  })

  return sla
}

const ClientExperience = ({ filters }: { filters: Mdu360TabProps }) => {
  const { $t } = useIntl()
  const { startDate: start, endDate: end } = filters

  const queryResults = useClientExperienceTimeseriesQuery({
    start,
    end
  })

  const sla = getSlaMap(queryResults.data)
  const starRatingSla = starRatingSLAKeys.map((key) => sla[key]).filter(Boolean)
  const sparklineSla = sparklineSLAKeys.map((key) => sla[key]).filter(Boolean)

  const tabDetails: ContentSwitcherProps['tabDetails'] = useMemo(
    () => [
      {
        label: $t({ defaultMessage: 'Star Rated' }),
        value: 'starRated',
        children:
          starRatingSla.length > 0 ? (
            <StarRatingContainer>
              {starRatingSla.map(({ starRatingTitle, percentage }) => (
                <StarRating
                  key={`starRated-${starRatingTitle}`}
                  name={starRatingTitle}
                  percentage={percentage}
                />
              ))}
            </StarRatingContainer>
          ) : (
            <NoData />
          )
      },
      {
        label: $t({ defaultMessage: 'Sparkline' }),
        value: 'sparkline',
        children:
          sparklineSla.length > 0 ? (
            <SparklineContainer>
              {sparklineSla.map(
                ({ sparklineTitle, percentageText, data, shortText }) => (
                  <Sparkline
                    key={`sparkline-${sparklineTitle}`}
                    name={sparklineTitle}
                    sparklineData={getSparklineData(data)}
                    percentageText={percentageText}
                    shortText={shortText}
                  />
                )
              )}
            </SparklineContainer>
          ) : (
            <NoData />
          )
      }
    ],
    [$t, sla]
  )

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Client Experience' })}>
        <AutoSizer>
          {({ height, width }) => (
            <ContentSwitcherWrapper height={height} width={width}>
              <ContentSwitcher
                tabDetails={tabDetails}
                align='right'
                size='small'
              />
            </ContentSwitcherWrapper>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}

export default ClientExperience
