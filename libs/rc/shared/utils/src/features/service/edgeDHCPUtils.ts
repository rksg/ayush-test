import _ from 'lodash'

import { LeaseTimeType }           from '../../models/EdgeDhcpEnum'
import { EdgeDhcpSettingFormData } from '../../types/services/edgeDhcpService'

export const convertEdgeDHCPFormDataToApiPayload = (formData: EdgeDhcpSettingFormData) => {
  const payload = _.cloneDeep(formData)

  if(payload.leaseTimeType === LeaseTimeType.INFINITE) {
    payload.leaseTime = -1 // -1 means infinite
  }

  // should remove UI used fields
  delete payload.enableSecondaryDNSServer
  delete payload.leaseTimeType

  // options & hosts should be empty when relay is ON
  if(payload.dhcpRelay) {
    payload.dhcpOptions = []
    payload.hosts = []
  }

  // should not create service with UI used id
  payload.dhcpPools.forEach(item => {
    if (item.id.startsWith('_NEW_')) item.id = ''
  })
  payload.dhcpOptions?.forEach(item => {
    if (item.id.startsWith('_NEW_')) item.id = ''
  })
  payload.hosts?.forEach(item => {
    if (item.id.startsWith('_NEW_')) item.id = ''
  })

  return payload
}