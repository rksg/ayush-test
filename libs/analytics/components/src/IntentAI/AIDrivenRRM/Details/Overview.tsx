
import { Typography }             from 'antd'
import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, recommendationBandMapping } from '@acx-ui/components'
import { get }                               from '@acx-ui/config'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { truthy }                            from '@acx-ui/utils'

import { DescriptionSection }     from '../../../DescriptionSection'
import { statusTrailMsgs }        from '../config'
import { EnhancedRecommendation } from '../services'

import { DownloadRRMComparison } from './Graph/DownloadRRMComparison'

// eslint-disable-next-line max-len
const introductionText = defineMessage({ defaultMessage: 'Choose between a network with maximum throughput, allowing some interference, or one with minimal interference, for high client density.' })

export const Overview = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const {
    sliceValue,
    status,
    updatedAt
  } = details
  const fields = [
    {
      label: $t({ defaultMessage: 'Intent' }),
      children: $t({ defaultMessage: 'Client density vs Client throughput' })
    },
    {
      label: $t({ defaultMessage: 'Category' }),
      children: $t({ defaultMessage: 'Wi-Fi Experience' })
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
    <Typography.Paragraph >{$t(introductionText)}</Typography.Paragraph>
    <DescriptionSection fields={fields} layout='horizontal' />
    {Object.keys(recommendationBandMapping).includes(details.code as string) &&
      <DownloadRRMComparison details={details} title={$t({ defaultMessage: 'RRM comparison' })} />}
  </Loader>
}
