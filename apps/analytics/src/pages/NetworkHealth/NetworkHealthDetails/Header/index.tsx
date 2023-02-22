import _                                                        from 'lodash'
import { IntlShape, MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Loader, SuspenseBoundary } from '@acx-ui/components'
import { formatter }                from '@acx-ui/utils'

import { authMethodsByCode }                                      from '../../authMethods'
import { useNetworkHealthTest }                                   from '../../services'
import { NetworkHealthTest }                                      from '../../types'
import { formatApsUnderTest, formatLastResult, statsFromSummary } from '../../utils'

import { ReRunButton }   from './ReRunTestButton'
import { TestRunButton } from './TestRunButton'

const { DefaultFallback: Spinner } = SuspenseBoundary

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

interface Subtitle {
  key: string,
  title: MessageDescriptor,
  format?: (details: NetworkHealthTest, $t: IntlShape['$t']) => string
}

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

const SubTitle = () => {
  const { $t } = useIntl()
  const queryResults = useNetworkHealthTest()
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

const Title = () => {
  const { $t } = useIntl()
  const queryResults = useNetworkHealthTest()
  const state = { ...queryResults, isLoading: false }
  const headerData = queryResults.data
    ? getHeaderData(queryResults.data) : {} as NetworkHealthTest

  return <Loader states={[state]} fallback={<Spinner size='default' />}>
    {headerData?.spec?.name || $t({ defaultMessage: 'Test' })}
  </Loader>
}

export { Title, SubTitle, ReRunButton, TestRunButton }
