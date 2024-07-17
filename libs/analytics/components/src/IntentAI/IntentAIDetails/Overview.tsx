
import { Typography } from 'antd'
import moment         from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { Loader, recommendationBandMapping } from '@acx-ui/components'
import { get }                               from '@acx-ui/config'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { truthy }                            from '@acx-ui/utils'

import { DescriptionSection }     from '../../DescriptionSection'
import { codes, statusTrailMsgs } from '../IntentAIForm/config'
import { EnhancedRecommendation } from '../IntentAIForm/services'

import { DownloadRRMComparison } from './Graph/DownloadRRMComparison'

export const Overview = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const {
    sliceValue,
    status,
    updatedAt,
    code
  } = details
  const intentType = codes[code].intentType
  const fields = [
    intentType && {
      label: $t({ defaultMessage: 'Intent' }),
      children: $t(intentType.intent)
    },
    intentType && {
      label: $t({ defaultMessage: 'Category' }),
      children: $t(intentType.category)
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
    <Typography.Paragraph >{intentType && $t(intentType.introduction)}</Typography.Paragraph>
    <DescriptionSection fields={fields} layout='horizontal' />
    {Object.keys(recommendationBandMapping).includes(details.code as string) &&
      <DownloadRRMComparison details={details} title={$t({ defaultMessage: 'RRM comparison' })} />}
  </Loader>
}
