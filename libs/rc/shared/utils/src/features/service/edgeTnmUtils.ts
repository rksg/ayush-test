import { MessageDescriptor, defineMessage } from 'react-intl'

import { EdgeTnmGraphTypeEnum } from '../../models/EdgeTnmServiceEnum'
import { EdgeTnmHostFormData }  from '../../types/services/edgeTnmService'

export const edgeTnmGraphTypeName: Record<EdgeTnmGraphTypeEnum, MessageDescriptor> = {
  [EdgeTnmGraphTypeEnum.NORMAL]: defineMessage({ defaultMessage: 'Normal' }),
  [EdgeTnmGraphTypeEnum.STACKED]: defineMessage({ defaultMessage: 'Stacked' }),
  [EdgeTnmGraphTypeEnum.EXPLODED]: defineMessage({ defaultMessage: 'Exploded' }),
  [EdgeTnmGraphTypeEnum.PIE]: defineMessage({ defaultMessage: 'Pie' })
}

export const edgeTnmHostFormRequestPreProcess = (data: EdgeTnmHostFormData) => {
  return {
    host: data.host,
    interfaces: [{
      interfaceid: data.interface.interfaceid,
      ip: data.interface.ip,
      port: data.interface.port,
      main: 1,
      type: 2,
      useip: 1,
      dns: '',
      details: {
        version: '2',
        community: 'zabbix'
      }
    }],
    groups: Array.isArray(data.groupIds)
      ? data.groupIds.map(groupid => ({ groupid }))
      : [{ groupid: data.groupIds }],
    templates: [{
      templateid: '10226'
    }],
    tags: [
      {
        tag: 'host-name',
        value: 'Sibi_Rodan_3u_Stack_Postman_2'
      }
    ]
  }
}