import _                                                        from 'lodash'
import { IntlShape, MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Loader, SuspenseBoundary } from '@acx-ui/components'
import { formatter }                from '@acx-ui/formatter'

import { authMethodsByCode }                    from '../../authMethods'
import { AuthenticationMethod }                 from '../../ServiceGuardForm/FormItems/AuthenticationMethod'
import { RadioBand }                            from '../../ServiceGuardForm/FormItems/RadioBand'
import { WlanName }                             from '../../ServiceGuardForm/FormItems/WlanName'
import { useServiceGuardTest }                  from '../../services'
import { ServiceGuardTest }                     from '../../types'
import { formatApsUnderTest, formatLastResult } from '../../utils'

import { ReRunButton }   from './ReRunTestButton'
import { TestRunButton } from './TestRunButton'

const { DefaultFallback: Spinner } = SuspenseBoundary

interface Subtitle {
  keys: string[],
  title: MessageDescriptor,
  format?: (details: ServiceGuardTest | undefined, $t: IntlShape['$t']) => string
}

const subtitles: Subtitle[] = [
  {
    keys: ['summary.apsTestedCount'],
    title: defineMessage({ defaultMessage: 'APs Under Test' }),
    format: (details) => formatApsUnderTest(details?.summary)
  },
  {
    keys: ['summary.apsSuccessCount', 'summary.apsTestedCount'],
    title: defineMessage({ defaultMessage: 'Test Result' }),
    format: (details) => formatLastResult(details?.summary)
  },
  {
    keys: ['config.wlanName'],
    title: WlanName.label
  },
  {
    keys: ['config.radio'],
    title: RadioBand.label,
    format: (details, $t) => _.get(details, 'config.radio')
      ? formatter('radioFormat')(details!.config.radio)
      : $t({ defaultMessage: 'Unknown' })
  },
  {
    keys: ['config.authenticationMethod'],
    title: AuthenticationMethod.label,
    format: (details, $t) => _.get(details, 'config.authenticationMethod')
      ? $t(authMethodsByCode[details!.config.authenticationMethod].title)
      : $t({ defaultMessage: 'Unknown' })
  }
]

const SubTitle = () => {
  const { $t } = useIntl()
  const queryResults = useServiceGuardTest()
  return <Loader states={[queryResults]} fallback={<Spinner size='small' />}>
    {subtitles
      .filter(({ keys }) => keys.every(key => _.has(queryResults.data, key)))
      .map(({ keys, title, format }) => [
        $t(title),
        format
          ? format(queryResults.data, $t)
          : (_.get(queryResults.data, keys[0]) || $t({ defaultMessage: 'Unknown' }))
      ].join(': ')).join(' | ') || $t({ defaultMessage: 'Test details' })}
  </Loader>
}

const Title = () => {
  const { $t } = useIntl()
  const queryResults = useServiceGuardTest()
  return <Loader states={[queryResults]} fallback={<Spinner size='default' />}>
    {queryResults.data?.spec?.name || $t({ defaultMessage: 'Test' })}
  </Loader>
}

export { Title, SubTitle, ReRunButton, TestRunButton }
