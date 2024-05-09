import { ApGroupNetworksTable } from '@acx-ui/rc/components'

import { useApGroupContext } from '../ApGroupContextProvider'



export default function ApGroupNetworksTab () {
  const { venueId, apGroupId } = useApGroupContext()
  const parmas = {
    venueId,
    apGroupId
  }

  return (
    <ApGroupNetworksTable {...parmas}/>
  )
}
