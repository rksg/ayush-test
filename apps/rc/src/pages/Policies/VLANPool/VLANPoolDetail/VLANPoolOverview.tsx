import { useIntl } from 'react-intl'

import { SummaryCard }        from '@acx-ui/components'
import { VLANPoolPolicyType } from '@acx-ui/rc/utils'

export default function VLANPoolOverview (props: { vlanPoolProfile: VLANPoolPolicyType }) {
  const { $t } = useIntl()
  const { vlanPoolProfile } = props
  const VLANPoolInfo = [
    {
      title: $t({ defaultMessage: 'Description' }),
      content: vlanPoolProfile.description?.toString()
    },
    {
      title: $t({ defaultMessage: 'VLANs' }),
      content: vlanPoolProfile.vlanMembers
    }
  ]

  return <SummaryCard data={VLANPoolInfo} />
}
