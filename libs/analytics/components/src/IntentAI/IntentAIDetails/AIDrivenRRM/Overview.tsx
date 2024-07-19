
import { Typography }             from 'antd'
import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, recommendationBandMapping } from '@acx-ui/components'
import { get }                               from '@acx-ui/config'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { truthy }                            from '@acx-ui/utils'

import { DescriptionSection }     from '../../../DescriptionSection'
import { statusTrailMsgs }        from '../../IntentAIForm/AIDrivenRRM'
import { EnhancedRecommendation } from '../../IntentAIForm/services'

import { DownloadRRMComparison } from './Graph/DownloadRRMComparison'

export const Overview = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const {
    sliceValue,
    status,
    updatedAt
  } = details
  // eslint-disable-next-line max-len
  const introduction= defineMessage({ defaultMessage: 'Choose between a network with maximum throughput, allowing some interference, or one with minimal interference, for high client density.' })
  const intent= defineMessage({ defaultMessage: 'Client density vs Client throughput' })
  const category= defineMessage({ defaultMessage: 'Wi-Fi Experience' })
  const fields = [
    {
      label: $t({ defaultMessage: 'Intent' }),
      children: $t(intent)
    },
    {
      label: $t({ defaultMessage: 'Category' }),
      children: $t(category)
    },
    {
      // eslint-disable-next-line max-len
      label: get('IS_MLISA_SA') ? $t({ defaultMessage: 'Zone' }) : $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      children: sliceValue
    },
    {
      label: $t({ defaultMessage: 'Status' }),
      children: $t(statusTrailMsgs[status])
    },
    {
      label: $t({ defaultMessage: 'Date' }),
      children: formatter(DateFormatEnum.DateTimeFormat)(moment(updatedAt))
    }
  ].filter(truthy)

  return <Loader>
    <Typography.Paragraph >{$t(introduction)}</Typography.Paragraph>
    <DescriptionSection fields={fields} layout='horizontal' />
    {Object.keys(recommendationBandMapping).includes(details.code as string) &&
      <DownloadRRMComparison details={details} title={$t({ defaultMessage: 'RRM comparison' })} />}
  </Loader>
}
