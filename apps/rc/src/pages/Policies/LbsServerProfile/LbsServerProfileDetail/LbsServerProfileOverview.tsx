import { useIntl } from 'react-intl'

import { SummaryCard }               from '@acx-ui/components'
import { LbsServerProfileViewModel } from '@acx-ui/rc/utils'

export function LbsServerProfileOverview (props: { data: LbsServerProfileViewModel }) {
  const { $t } = useIntl()
  const { data } = props

  const lbsServerProfileInfo = [
    {
      title: $t({ defaultMessage: 'LBS Venue' }),
      content: data.lbsVenueName
    },
    {
      title: $t({ defaultMessage: 'Server' }),
      content: data.server
    }
  ]

  return (
    <SummaryCard data={lbsServerProfileInfo} colPerRow={6} />
  )
}
