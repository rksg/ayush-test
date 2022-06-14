import { useParams } from '@acx-ui/react-router-dom'

import { Aps } from '../../Devices/Aps/Aps'

export function NetworkApsTab () {
  const params = useParams()
  const filters = { networkId: [params.networkId || ''] }
  return (
    <Aps filters={filters} />
  )
}
