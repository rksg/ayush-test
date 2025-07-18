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
import { UseQueryResult } from '@acx-ui/types'

import { ContentSwitcherWrapper }  from '../../styledComponents'
import { Mdu360TabProps, SLAKeys } from '../../types'
import { SLAData }                 from '../SLA/services'

import {
  FranchisorTimeseries,
  useClientExperienceTimeseriesQuery
} from './services'
import Sparkline                                      from './Sparkline'
import StarRating                                     from './StarRating'
import { StarRatingContainer, SparklineContainer }    from './styledComponents'
import { getConfig, getPercentage, getSparklineData } from './utils'

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

const slaKeysToShow: SLAKeys[] = [
  SLAKeys.connectionSuccessSLA,
  SLAKeys.timeToConnectSLA,
  SLAKeys.clientThroughputSLA
]

type SlaMap = Record<SLAKeys, SLA>

const getSlaMap = (
  data: FranchisorTimeseries | undefined,
  thresholds: SLAData
): SlaMap => {
  if (!data) return {} as SlaMap

  const sla: Record<SLAKeys, SLA> = {} as SlaMap
  const config = getConfig(thresholds)

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
        shortText,
        starRatingTitle,
        sparklineTitle,
        data: value
      })
    }
  })

  return sla
}

interface ClientExperienceProps {
  filters: Mdu360TabProps
  slaQueryResults: UseQueryResult<SLAData>
}

const ClientExperience = ({
  filters,
  slaQueryResults
}: ClientExperienceProps) => {
  const { $t } = useIntl()
  const { startDate: start, endDate: end } = filters

  const queryResults = useClientExperienceTimeseriesQuery({
    start,
    end
  })

  const thresholds = slaQueryResults.data ?? {} as SLAData
  const slaData = getSlaMap(queryResults.data, thresholds)
  const sla = slaKeysToShow.map((key) => slaData[key]).filter(Boolean)

  const tabDetails: ContentSwitcherProps['tabDetails'] = useMemo(
    () => [
      {
        label: $t({ defaultMessage: 'Star Rated' }),
        value: 'starRated',
        children:
          sla.length > 0 ? (
            <StarRatingContainer>
              {sla.map(({ starRatingTitle, percentage }) => (
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
          sla.length > 0 ? (
            <SparklineContainer>
              {sla.map(
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
    <Loader states={[queryResults, slaQueryResults]}>
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
