import _                                                        from 'lodash'
import { defineMessage, IntlShape, MessageDescriptor, useIntl } from 'react-intl'

import { noDataSymbol }                                        from '@acx-ui/analytics/utils'
import { Loader, PageHeader, Tabs, SuspenseBoundary, Button }  from '@acx-ui/components'
import { generatePath, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { formatter, intlFormats }                              from '@acx-ui/utils'

import { authMethodsByCode }                             from '../authMethods'
import { useNetworkHealthTest, NetworkHealthTestResult } from '../services'

import { Details }  from './Details'
import { Overview } from './Overview'

const { DefaultFallback: Spinner } = SuspenseBoundary

type NetworkHealthTabs = 'overview' | 'details' | 'progress'

const tabs : {
  key: NetworkHealthTabs,
  title: MessageDescriptor,
  component: ({ details }: { details: NetworkHealthTestResult }) => JSX.Element
}[] = [
  {
    key: 'overview',
    title: defineMessage({ defaultMessage: 'Overview' }),
    component: Overview
  },
  {
    key: 'details',
    title: defineMessage({ defaultMessage: 'Details' }),
    component: Details
  }
]

interface Header extends NetworkHealthTestResult {
  isOngoing?: boolean
  apsUnderTest?: number
  apsFinishedTest?: number
  lastResult?: number
}

const statsFromSummary = (
  summary: NetworkHealthTestResult['summary']
) => {
  const { apsTestedCount: apsUnderTest, apsPendingCount, apsSuccessCount }
    = summary as Record<string, number>
  const isOngoing = apsPendingCount !== undefined && apsPendingCount > 0
  const apsFinishedTest = apsUnderTest
    ? apsUnderTest - apsPendingCount
    : undefined
  const lastResult = apsUnderTest
    ? apsSuccessCount / apsUnderTest
    : undefined
  return { isOngoing, apsFinishedTest, lastResult, apsUnderTest }
}

const getHeaderData = (details: NetworkHealthTestResult) => {
  const { isOngoing, apsUnderTest, apsFinishedTest, lastResult
  } = statsFromSummary(details.summary)
  return { ...details,
    ...(isOngoing && { isOngoing }),
    ...(apsUnderTest !== undefined && { apsUnderTest }),
    ...(apsFinishedTest !== undefined && { apsFinishedTest }),
    ...(lastResult !== undefined && { lastResult })
  }
}

interface Subtitle {
  key: string,
  title: MessageDescriptor,
  format?: (details: NetworkHealthTestResult, $t: IntlShape['$t']) => string
}

export const formatApsUnderTest = (
  details: Header, $t: IntlShape['$t']
) => details.isOngoing
  ? $t(
    { defaultMessage:
      '{apsFinishedTest} of {apsUnderTest} {apsUnderTest, plural, one {AP} other {APs}} tested' },
    { apsFinishedTest: details.apsFinishedTest, apsUnderTest: details.apsUnderTest })
  : details.apsUnderTest
    ? $t({ defaultMessage: '{apsUnderTest} APs' }, { apsUnderTest: details.apsUnderTest })
    : noDataSymbol

export const formatLastResult = (
  details: Header, $t: IntlShape['$t']
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
  { key: 'config.wlanName', title: defineMessage({ defaultMessage: 'WLAN' }) },
  {
    key: 'config.radio',
    title: defineMessage({ defaultMessage: 'Radio Band' }),
    format: (details, $t) => details.config.radio
      ? formatter('radioFormat')(details.config.radio) : $t({ defaultMessage: 'Unknown' })
  },
  {
    key: 'config.authenticationMethod',
    title: defineMessage({ defaultMessage: 'Authentication Method' }),
    format: (details, $t) => details.config.authenticationMethod
      ? $t(authMethodsByCode[details.config.authenticationMethod].text)
      : $t({ defaultMessage: 'Unknown' })
  }
]

const rootPath = '/serviceValidation/networkHealth'

function NetworkHealthDetails () {
  const { $t } = useIntl()
  const { activeTab = tabs[0].key, ...ids } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(generatePath(`${rootPath}/:specId/tests/:testId/tab`, ids))
  const queryResults = useNetworkHealthTest()
  const state = { ...queryResults, isLoading: false }

  const onTabChange = (tab: string) => navigate({
    ...basePath,
    pathname: `${basePath.pathname}/${tab}`
  })
  const Tab = tabs.find(tab => tab.key === activeTab)?.component

  const headerData = queryResults.data
    ? getHeaderData(queryResults.data) : {} as NetworkHealthTestResult
  return (
    <>
      <PageHeader
        title={<Loader states={[state]} fallback={<Spinner size='default' />}>
          {headerData?.spec?.name || $t({ defaultMessage: 'Test' })}
        </Loader>}
        subTitle={<Loader states={[state]} fallback={<Spinner size='small' />}>
          {subtitles.filter(({ key }) => _.get(headerData, key) !== undefined)
            .map(({ key, title, format }) => [
              $t(title),
              ( format ? format(headerData, $t) : _.get(headerData, key)) ||
                $t({ defaultMessage: 'Unknown' })
            ].join(': ')).join(' | ') || $t({ defaultMessage: 'Test details' })}
        </Loader>}
        breadcrumb={[{
          text: $t({ defaultMessage: 'Service Validation' }),
          link: '/serviceValidation'
        }, {
          text: $t({ defaultMessage: 'Network Health' }),
          link: '/serviceValidation/networkHealth'
        }]}
        // TODO
        extra={[
          <Button size='small' type='primary'>{$t({ defaultMessage: 'Re-Run Test' })}</Button>,
          <Button size='small' type='primary'>{$t({ defaultMessage: 'Test Time' })}</Button>
        ]}
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            {tabs.map(({ key, title }) => <Tabs.TabPane tab={$t(title)} key={key} />)}
          </Tabs>
        }
      />
      {Tab && <Loader states={[queryResults]}>
        <Tab details={queryResults.data as NetworkHealthTestResult}/>
      </Loader>}
    </>
  )
}

export default NetworkHealthDetails
