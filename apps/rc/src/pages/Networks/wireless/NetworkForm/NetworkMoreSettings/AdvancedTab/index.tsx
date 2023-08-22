import { useContext } from 'react'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import NetworkFormContext     from '../../NetworkFormContext'
import { QosMapSetFrom }      from '../QosMapSetFrom'
import { UserConnectionForm } from '../UserConnectionForm'


export function AdvancedTab () {
  const { data } = useContext(NetworkFormContext)

  const UserConnectionComponent = () => {
    return (
      <div style={{ maxWidth: '600px' }}>
        <UserConnectionForm />
      </div>
    )
  }

  return (
    <>
      <QosMapSetFrom/>

      {data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
        <UserConnectionComponent/>
      }
    </>
  )
}
