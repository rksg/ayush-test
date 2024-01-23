import { useEffect, useState } from 'react'

import _, { cloneDeep } from 'lodash'

import {
  useLazyGetEdgeLagSubInterfacesStatusListQuery,
  useLazyGetEdgeLagsStatusListQuery,
  useLazyGetEdgePortsStatusListQuery,
  useLazyGetEdgeSubInterfacesStatusListQuery
} from '@acx-ui/rc/services'
import { EdgePortTypeEnum, EdgeStatus } from '@acx-ui/rc/utils'

interface LanInterfacesType {
  serialNumber: string
  portName: string
  ip: string
  subnet: string
}

export const useGetLanInterfaces = (edgeList?: EdgeStatus[]) => {
  const [lanPorts, setLanPorts] = useState<LanInterfacesType[]>([])
  const [lanLags, setLanLags] = useState<LanInterfacesType[]>([])
  const [lanSubInterfaces, setLanSubInterfaces] = useState<LanInterfacesType[]>([])
  const [lanLagSubInterfaces, setLanLagSubInterfaces] = useState<LanInterfacesType[]>([])
  const [getEdgePortStatusList, { isLoading: isPortLoading }] = useLazyGetEdgePortsStatusListQuery()
  const [getEdgeLagsStatusList, { isLoading: isLagLoading }] = useLazyGetEdgeLagsStatusListQuery()
  // eslint-disable-next-line max-len
  const [getEdgeSubInterfaces, { isLoading: isSubInterfaceLoading }] = useLazyGetEdgeSubInterfacesStatusListQuery()
  // eslint-disable-next-line max-len
  const [getEdgeLagSubInterfaces, { isLoading: isLagSubInterfaceLoading }] = useLazyGetEdgeLagSubInterfacesStatusListQuery()

  useEffect(() => {
    if(lanPorts.length === 0 && lanLags.length === 0 &&
      lanSubInterfaces.length ===0 && lanLagSubInterfaces.length === 0) {
      const portPayload = { filters: { type: [EdgePortTypeEnum.LAN] } }
      const lagPayload = { filters: { portType: [EdgePortTypeEnum.LAN] } }
      edgeList?.forEach(node => {
        getEdgePortStatusList({
          params: { serialNumber: node.serialNumber },
          payload: portPayload
        }).then(({ data }) => {
          setLanPorts(prev => {
            const newArr = cloneDeep(prev)
            newArr.push(...(data?.map(item => ({
              serialNumber: node.serialNumber,
              portName: _.capitalize(item.interfaceName),
              ip: item.ip,
              subnet: item.subnet
            })) ?? []))
            return newArr
          })
        })
        getEdgeLagsStatusList({
          params: { serialNumber: node.serialNumber },
          payload: lagPayload
        }).then(({ data }) => {
          setLanLags(prev => {
            const newArr = cloneDeep(prev)
            newArr.push(...(data?.data.map(item => ({
              serialNumber: node.serialNumber,
              portName: _.capitalize(item.name),
              ip: item.ip ?? '',
              subnet: item.subnet ?? ''
            })) ?? []))
            return newArr
          })
        })
        getEdgeSubInterfaces({
          payload: { filters: { ...portPayload.filters, serialNumber: [node.serialNumber] } }
        }).then(({ data }) => {
          setLanSubInterfaces(prev => {
            const newArr = cloneDeep(prev)
            newArr.push(...(data?.data.map(item => ({
              serialNumber: node.serialNumber,
              portName: _.capitalize(item.interfaceName),
              ip: item.ip,
              subnet: item.subnet
            })) ?? []))
            return newArr
          })
        })
        getEdgeLagSubInterfaces({
          params: { serialNumber: node.serialNumber },
          payload: lagPayload
        }).then(({ data }) => {
          setLanLagSubInterfaces(prev => {
            const newArr = cloneDeep(prev)
            newArr.push(...(data?.data.map(item => ({
              serialNumber: node.serialNumber,
              portName: _.capitalize(item.name),
              ip: item.ip ?? '',
              subnet: item.subnet ?? ''
            })) ?? []))
            return newArr
          })
        })
      })
    }
  }, [edgeList])

  return {
    lanInterfaces: converToReturnValue(lanPorts, lanLags, lanSubInterfaces, lanLagSubInterfaces),
    isLoading: isPortLoading || isSubInterfaceLoading ||
      isLagLoading || isLagSubInterfaceLoading
  }
}

const converToReturnValue = (...lanInterfaces: LanInterfacesType[][]) => {
  return lanInterfaces.flatMap(item => item).reduce((a, v) => {
    const cur = a[v.serialNumber] ?? []
    cur.push(v)
    return {
      ...a,
      [v.serialNumber]: cur
    }
  }, {} as { [key: string]: LanInterfacesType[] })
}