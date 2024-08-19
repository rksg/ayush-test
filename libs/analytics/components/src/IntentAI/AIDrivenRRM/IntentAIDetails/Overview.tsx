
import { Typography } from 'antd'
import moment         from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { Descriptions }              from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { getIntentStatus }       from '../../common/getIntentStatus'
import { codes }                 from '../../config'
import { useIntentContext }      from '../../IntentContext'
import { DownloadRRMComparison } from '../RRMGraph/DownloadRRMComparison'

export const Overview = () => {
  const { $t } = useIntl()
  const { intent: { sliceValue, status, updatedAt, code } } = useIntentContext()
  const contents = codes[code]
  return <>
    <Typography.Paragraph children={$t({
      defaultMessage: 'Choose between a network with maximum throughput, ' +
        'allowing some interference, or one with minimal interference, ' +
        'for high client density.'
    })} />
    <Descriptions noSpace>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Intent' })}
        children={$t(contents.intent)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Category' })}
        children={$t(contents.category)}
      />
      <Descriptions.Item
        label={get('IS_MLISA_SA')
          ? $t({ defaultMessage: 'Zone' })
          : $t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={sliceValue}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        children={getIntentStatus(status)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Date' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(moment(updatedAt))}
      />
    </Descriptions>
    <br />
    <DownloadRRMComparison title={$t({ defaultMessage: 'RRM comparison' })} />
  </>
}
