
import { ClockCircleFilled } from '@ant-design/icons'
import { useIntl }           from 'react-intl'

import { Tooltip }         from '@acx-ui/components'
import { notAvailableMsg } from '@acx-ui/utils'

import { ActiveButton } from './styledComponents'



export default function ActivityHeaderButton () {


  const ActivityHeaderButton = () => {
    return <Tooltip title={useIntl().$t(notAvailableMsg)}>
      <ActiveButton disabled
        icon={<ClockCircleFilled />} />
    </Tooltip>
  }

  return <ActivityHeaderButton />
}
