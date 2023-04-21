import { createContext } from 'react'

import _             from 'lodash'
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { useGetApMeshTopologyQuery, useMeshApsQuery } from '@acx-ui/rc/services'
import { APMesh, APMeshRole, ApMeshLink, Uplink }     from '@acx-ui/rc/utils'

export interface ApMeshTopologyDevice {
  serialNumber: string
  meshRole: APMeshRole
  hops?: number
  downlinkCount?: number
  downlinkUnplacedCount?: number
  rootApName?: string
  isRootApUnplaced?: boolean
  floorplanId?: string
}

export interface ApMeshTopologyContextProps {
  isApMeshTopologyEnabled: boolean
  meshDeviceList: ApMeshTopologyDevice[] | undefined
  meshLinkList: ApMeshLink[] | undefined
}

// eslint-disable-next-line max-len
export const ApMeshTopologyContext = createContext<ApMeshTopologyContextProps>({} as ApMeshTopologyContextProps)

export interface ApMeshTopologyContextProviderProps {
  isApMeshTopologyEnabled: boolean
  floorplanId: string
  children: JSX.Element
}

export function ApMeshTopologyContextProvider (props: ApMeshTopologyContextProviderProps ) {
  const { children, isApMeshTopologyEnabled, floorplanId } = props
  const params = useParams<{ tenantId: string, venueId: string }>()
  const isApMeshTopologyFFOn = useIsSplitOn(Features.AP_MESH_TOPOLOGY)

  if (!isApMeshTopologyFFOn) return children


  const apMeshListPayload = {
    fields: ['name', 'serialNumber', 'apMac', 'downlink', 'apDownRssis', 'uplink', 'apUpRssi',
      'meshRole', 'hops', 'apRssis', 'xPercent', 'yPercent', 'floorplanId'],
    filters: {
      meshRole: [APMeshRole.RAP, APMeshRole.MAP, APMeshRole.EMAP],
      venueId: [params.venueId]
    }
  }
  const { apMeshTopologyDeviceList } = useMeshApsQuery({ params, payload: apMeshListPayload }, {
    selectFromResult ({ data }) {
      return {
        apMeshTopologyDeviceList: data && flatApMeshList(data.data)
      }
    }
  })

  const { data: apMeshTopologyData } = useGetApMeshTopologyQuery({ params })

  const {
    meshDeviceList,
    meshLinkList
  } = filterByFloorplan(apMeshTopologyDeviceList, apMeshTopologyData?.edges, floorplanId)

  return <ApMeshTopologyContext.Provider
    value={{
      isApMeshTopologyEnabled,
      meshDeviceList,
      meshLinkList
    }}
    children={children}
  />
}

function flatApMeshList (apMeshList: APMesh[]): ApMeshTopologyDevice[] {
  const newList: ApMeshTopologyDevice[] = []

  apMeshList.forEach(apMesh => convertToMeshTopologyDevice(apMesh, null, newList))

  return newList
}

function convertToMeshTopologyDevice (
  apMesh: APMesh,
  rootApMesh: APMesh | null,
  result: ApMeshTopologyDevice[]
) {
  result.push({
    serialNumber: apMesh.serialNumber,
    meshRole: apMesh.meshRole,
    hops: apMesh.hops,
    downlinkCount: apMesh.downlinkCount,
    downlinkUnplacedCount: apMesh.downlink ? apMesh.downlink.filter(isApUnplaced).length : 0,
    isRootApUnplaced: rootApMesh ? isApUnplaced(rootApMesh) : false,
    rootApName: rootApMesh?.name,
    floorplanId: apMesh.floorplanId
  })

  if (apMesh.downlink && apMesh.downlink.length > 0) {
    apMesh.downlink.forEach(ap => convertToMeshTopologyDevice(ap, rootApMesh ?? apMesh, result))
  }
}

function isApUnplaced (apMesh: APMesh): boolean {
  return _.isUndefined(apMesh.floorplanId)
}

function filterByFloorplan (
  incomingMeshDeviceList: ApMeshTopologyDevice[] | undefined,
  incomingMeshLinkList: ApMeshLink[] | undefined,
  floorplanId: string
): Pick<ApMeshTopologyContextProps, 'meshDeviceList' | 'meshLinkList'> {

  let filteredMeshDeviceList: ApMeshTopologyDevice[]
  if (!incomingMeshDeviceList) {
    filteredMeshDeviceList = []
  } else {
    filteredMeshDeviceList = incomingMeshDeviceList.filter(ap => ap.floorplanId === floorplanId)
  }

  let filteredMeshLinkList: ApMeshLink[]
  if (!incomingMeshLinkList) {
    filteredMeshLinkList = []
  } else {
    filteredMeshLinkList = incomingMeshLinkList.filter((apMeshLink: ApMeshLink) => {
      return filteredMeshDeviceList.find(m => m.serialNumber === apMeshLink.from) &&
        filteredMeshDeviceList.find(m => m.serialNumber === apMeshLink.to)
    })
  }

  return {
    meshDeviceList: filteredMeshDeviceList,
    meshLinkList: filteredMeshLinkList
  }
}
