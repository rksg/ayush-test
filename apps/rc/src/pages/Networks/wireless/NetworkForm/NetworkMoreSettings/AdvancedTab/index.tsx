import { useContext } from 'react'

import NetworkFormContext from '../../NetworkFormContext'

import QoS from './QoS'


export function AdvancedTab () {
  const { data } = useContext(NetworkFormContext)

  return (
    <QoS wlanData={data} />
  )
}
