import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import NetworkFormContext     from '../../NetworkFormContext'
import * as UI                from '../styledComponents'
import { UserConnectionForm } from '../UserConnectionForm'


export function AdvancedTab () {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)

  const isSupportQosMap = false //useIsSplitOn(Features.xxxx)


  const UserConnectionComponent = () => {
    return (
      <div style={{ maxWidth: '600px' }}>
        <UserConnectionForm />
      </div>
    )
  }

  return (
    <>
      {isSupportQosMap &&
      <>
        <UI.Subtitle>{$t({ defaultMessage: 'QoS Map' })}</UI.Subtitle>
        <div> implementing... </div>
      </>}

      {data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
        <UserConnectionComponent/>
      }
    </>
  )
}
