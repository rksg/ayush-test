import _                                                        from 'lodash'
import { IntlShape, MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { noDataSymbol }             from '@acx-ui/analytics/utils'
import { Loader, SuspenseBoundary } from '@acx-ui/components'
import { formatter, intlFormats }   from '@acx-ui/utils'

import { authMethodsByCode }    from '../../authMethods'
import { useNetworkHealthTest } from '../../services'
import { NetworkHealthTest }    from '../../types'

import { ReRunButton }   from './ReRunTestButton'
import { TestRunButton } from './TestRunButton'

const { DefaultFallback: Spinner } = SuspenseBoundary

export const statsFromSummary = (
  summary: NetworkHealthTest['summary']
) => {
  const { apsTestedCount: apsUnderTest, apsPendingCount, apsSuccessCount }
    = summary
  const isOngoing = apsPendingCount !== undefined && apsPendingCount > 0
  const apsFinishedTest = apsUnderTest
    ? apsUnderTest - apsPendingCount
    : undefined
  const lastResult = apsUnderTest
    ? apsSuccessCount / apsUnderTest
    : undefined
  return { isOngoing, apsFinishedTest, lastResult, apsUnderTest }
}

const getHeaderData = (details: NetworkHealthTest) => {
  const { isOngoing, apsUnderTest, apsFinishedTest, lastResult
  } = statsFromSummary(details.summary)
  return { ...details,
    ...(isOngoing && { isOngoing }),
    ...(apsUnderTest !== undefined && { apsUnderTest }),
    ...(apsFinishedTest !== undefined && { apsFinishedTest }),
    ...(lastResult !== undefined && { lastResult })
  }
}

interface NetworkHealthHeader extends NetworkHealthTest {
  isOngoing?: boolean
  apsUnderTest?: number
  apsFinishedTest?: number
  lastResult?: number
}

interface Subtitle {
  key: string,
  title: MessageDescriptor,
  format?: (details: NetworkHealthTest, $t: IntlShape['$t']) => string
}

export const formatApsUnderTest = (
  details: NetworkHealthHeader, $t: IntlShape['$t']
) => details.isOngoing
  ? $t(
    { defaultMessage:
      '{apsFinishedTest} of {apsUnderTest} {apsUnderTest, plural, one {AP} other {APs}} tested' },
    { apsFinishedTest: details.apsFinishedTest, apsUnderTest: details.apsUnderTest })
  : details.apsUnderTest
    ? $t({ defaultMessage: '{apsUnderTest} APs' }, { apsUnderTest: details.apsUnderTest })
    : noDataSymbol

export const formatLastResult = (
  details: NetworkHealthHeader, $t: IntlShape['$t']
) => details.isOngoing
  ? $t({ defaultMessage: 'In progress...' })
  : details.lastResult !== undefined
    ? $t({ defaultMessage: '{lastResultPercent} pass' }, {
      lastResultPercent: $t(intlFormats.percentFormat, { value: details.lastResult })
    })
    : noDataSymbol

const subtitles: Subtitle[] = [
  {
    key: 'apsUnderTest',
    title: defineMessage({ defaultMessage: 'APs Under Test' }),
    format: formatApsUnderTest
  },
  {
    key: 'lastResult',
    title: defineMessage({ defaultMessage: 'Test Result' }),
    format: formatLastResult
  },
  {
    key: 'config.wlanName',
    title: defineMessage({ defaultMessage: 'WLAN' })
  },
  {
    key: 'config.radio',
    title: defineMessage({ defaultMessage: 'Radio Band' }),
    format: (details, $t) => _.get(details, 'config.radio')
      ? formatter('radioFormat')(details.config.radio)
      : $t({ defaultMessage: 'Unknown' })
  },
  {
    key: 'config.authenticationMethod',
    title: defineMessage({ defaultMessage: 'Authentication Method' }),
    format: (details, $t) => _.get(details, 'config.authenticationMethod')
      ? $t(authMethodsByCode[details.config.authenticationMethod].title)
      : $t({ defaultMessage: 'Unknown' })
  }
]

const SubTitle = (
  { queryResults }: { queryResults: ReturnType<typeof useNetworkHealthTest> }
) => {
  const { $t } = useIntl()
  const state = { ...queryResults, isLoading: false }
  const headerData = queryResults.data
    ? getHeaderData(queryResults.data) : {} as NetworkHealthTest

  return <Loader states={[state]} fallback={<Spinner size='small' />}>
    {subtitles
      .filter(({ key }) => _.has(headerData, key))
      .map(({ key, title, format }) => [
        $t(title),
        format
          ? format(headerData, $t)
          : (_.get(headerData, key) || $t({ defaultMessage: 'Unknown' }))
      ].join(': ')).join(' | ') || $t({ defaultMessage: 'Test details' })}
  </Loader>
}

const Title = (
  { queryResults }: { queryResults: ReturnType<typeof useNetworkHealthTest> }
) => {
  const { $t } = useIntl()
  const state = { ...queryResults, isLoading: false }
  const headerData = queryResults.data
    ? getHeaderData(queryResults.data) : {} as NetworkHealthTest

  return <Loader states={[state]} fallback={<Spinner size='default' />}>
    {headerData?.spec?.name || $t({ defaultMessage: 'Test' })}
  </Loader>
}

export { Title, SubTitle, ReRunButton, TestRunButton }
