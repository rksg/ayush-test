
import { Typography } from 'antd'
import moment         from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { Descriptions, Loader }      from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { EnhancedIntent } from '../../IntentAIForm/services'
// TODO
// move kpis into common
import { statusTrailMsgs }       from '../IntentAIForm'
import { DownloadRRMComparison } from '../RRMGraph/DownloadRRMComparison'

export const Overview = ({ details }: { details: EnhancedIntent }) => {
  const { $t } = useIntl()
  const {
    sliceValue,
    status,
    updatedAt
  } = details
  return <Loader>
    <Typography.Paragraph children={$t({
      defaultMessage: 'Choose between a network with maximum throughput, ' +
        'allowing some interference, or one with minimal interference, ' +
        'for high client density.'
    })} />
    <Descriptions noSpace>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Intent' })}
        children={$t({ defaultMessage: 'Client density vs Client throughput' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Category' })}
        children={$t({ defaultMessage: 'Wi-Fi Experience' })}
      />
      <Descriptions.Item
        label={get('IS_MLISA_SA')
          ? $t({ defaultMessage: 'Zone' })
          : $t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={sliceValue}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        // TODO: fix below to do without keyof typeof
        children={$t(statusTrailMsgs[status as keyof typeof statusTrailMsgs])}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Date' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(moment(updatedAt))}
      />
    </Descriptions>
    <br />
    <DownloadRRMComparison details={details} title={$t({ defaultMessage: 'RRM comparison' })} />
  </Loader>
}
