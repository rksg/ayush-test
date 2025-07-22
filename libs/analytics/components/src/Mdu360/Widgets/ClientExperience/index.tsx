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
  title: string
  // starRating
  percentage: number
  // sparkline
  percentageText: string
  data: number[]
  shortText?: string
}

const config = getConfig()

const slaKeysToShow: SLAKeys[] = [
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
        title,
        shortText
      } = config[slaKey]
      sla[slaKey] = ({
        ...percentage,
        shortText,
        title,
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

  const slaData = getSlaMap(queryResults.data)
  const sla = slaKeysToShow.map((key) => slaData[key]).filter(Boolean)

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
