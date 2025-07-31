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
import { getIntl }        from '@acx-ui/utils'

import { useClientExperienceTimeseriesQuery } from '../../services'
import { ContentSwitcherWrapper }             from '../../styledComponents'
import { Mdu360TabProps, SLAKeys }            from '../../types'
import { slaConfigWithData }                  from '../SLA/config'
import { SLAConfigWithData, SLAData }         from '../SLA/types'

import Sparkline                                   from './Sparkline'
import StarRating                                  from './StarRating'
import { StarRatingContainer, SparklineContainer } from './styledComponents'
import { FranchisorTimeseries }                    from './types'
import { getPercentage, getSparklineData }         from './utils'

interface SLA {
  title: string
  // starRating
  percentage: number
  // sparkline
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
  slaConfig: SLAConfigWithData[]
): SlaMap => {
  if (!data) return {} as SlaMap

  const { $t } = getIntl()
  const sla: Record<SLAKeys, SLA> = {} as SlaMap
  const config = slaConfig.reduce((acc, threshold) => {
    acc[threshold.slaKey] = threshold
    return acc
  }, {} as Record<SLAKeys, SLAConfigWithData>)

  const { errors, time, ...slaData } = data
  Object.entries(slaData).forEach(([key, value]) => {
    const slaKey = key as SLAKeys
    const percentage = getPercentage(value)
    if (percentage.percentage && config[slaKey]) {
      const {
        title,
        shortText
      } = config[slaKey]
      sla[slaKey] = ({
        ...percentage,
        shortText,
        title: $t(title),
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

  const sla = useMemo(() => {
    const slaConfig = slaConfigWithData(slaQueryResults.data ?? {} as SLAData)
    const slaData = getSlaMap(queryResults.data, slaConfig)
    return slaKeysToShow.map((key) => slaData[key]).filter(Boolean)
  }, [queryResults.data, slaQueryResults.data])

  const tabDetails: ContentSwitcherProps['tabDetails'] = useMemo(
    () => [
      {
        label: $t({ defaultMessage: 'Star Rated' }),
        value: 'starRated',
        children:
          sla.length > 0 ? (
            <StarRatingContainer>
              {sla.map(({ title, percentage }) => (
                <StarRating
                  key={`starRated-${title}`}
                  name={title}
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
                ({ title, percentageText, data, shortText }) => (
                  <Sparkline
                    key={`sparkline-${title}`}
                    name={title}
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
