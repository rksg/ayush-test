
import { ClockCircleFilled } from '@ant-design/icons'
import { useIntl }           from 'react-intl'

import { LayoutUI, cssStr, Tooltip } from '@acx-ui/components'
import { notAvailableMsg }           from '@acx-ui/utils'


export default function ActivityHeaderButton () {


  const ActivityHeaderButton = () => {
    return <Tooltip title={useIntl().$t(notAvailableMsg)}>
      <LayoutUI.ButtonSolid style={{
        background: cssStr('--acx-neutrals-80'),
        color: cssStr('--acx-neutrals-60')
      }}
      disabled
      icon={<ClockCircleFilled />} />
    </Tooltip>
  }

  return <ActivityHeaderButton />
}
