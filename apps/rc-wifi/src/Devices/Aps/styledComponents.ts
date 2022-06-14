import styled from 'styled-components/macro'

import { DeviceConnectionStatus } from '@acx-ui/rc/utils'

export const handleStatusColor = (color: string | undefined) => {
  switch (color) {
    case DeviceConnectionStatus.INITIAL:
      return 'var(--acx-neutrals-50)'
    case DeviceConnectionStatus.ALERTING:
      return 'var(--acx-semantics-yellow-40)'
    case DeviceConnectionStatus.DISCONNECTED:
      return 'var(--acx-semantics-red-60)'
    case DeviceConnectionStatus.CONNECTED:
      return 'var(--acx-semantics-green-50)'
    default:
      return 'var(--acx-neutrals-50)'
  }
}

export const DeviceStatusIcon = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 999em;
  background-color:  ${({ color }) => handleStatusColor(color)};
`
export const StatusColumn = styled.div`
  grid-template-columns: 15px 1fr;
  display: grid;
  align-items: center
`
