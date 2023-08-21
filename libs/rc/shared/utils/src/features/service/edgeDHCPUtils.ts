import _ from 'lodash'

import { LeaseTimeType }           from '../../models/EdgeDhcpEnum'
import { EdgeDhcpSettingFormData } from '../../types/services/edgeDhcpService'

export const convertEdgeDHCPFormDataToApiPayload = (formData: EdgeDhcpSettingFormData) => {
  const payload = _.cloneDeep(formData)

  // should remove UI used fields
  delete payload.enableSecondaryDNSServer
  delete payload.leaseTimeType
  delete payload.usedForNSG

  if(formData.leaseTimeType === LeaseTimeType.INFINITE) {
    payload.leaseTime = -1 // -1 means infinite
  }

  // pools is not configurable when usedForNSG is OFF && relay is ON
  // so that it should be empty when usedForNSG is OFF && relay is ON
  if(!formData.usedForNSG && formData.dhcpRelay) {
    payload.dhcpPools = []
  }

  // options & hosts should be empty when relay is ON
  if(formData.dhcpRelay) {
    payload.dhcpOptions = []
    payload.hosts = []
  }

  // should not create service with UI used id
  payload.dhcpPools?.forEach(item => {
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