import { ClockCircleFilled } from '@ant-design/icons'
import { useIntl }           from 'react-intl'

import { Tooltip }         from '@acx-ui/components'
import { notAvailableMsg } from '@acx-ui/utils'

import { DisabledButton } from './styledComponents'

export default function ActivityHeaderButton () {
  return <Tooltip title={useIntl().$t(notAvailableMsg)}>
    <DisabledButton disabled icon={<ClockCircleFilled />} />
  </Tooltip>
}
