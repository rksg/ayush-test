import { createContext } from 'react'

import _             from 'lodash'
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { useGetApMeshTopologyQuery, useGetFloorPlanMeshApsQuery } from '@acx-ui/rc/services'
import { FloorPlanMeshAP, APMeshRole, ApMeshLink }                from '@acx-ui/rc/utils'

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
  venueId?: string
}

export function ApMeshTopologyContextProvider (props: ApMeshTopologyContextProviderProps ) {
  const params = useParams<{ tenantId: string, venueId: string }>()
  const { children, isApMeshTopologyEnabled, floorplanId, venueId = params.venueId } = props
  const isApMeshTopologyFFOn = useIsSplitOn(Features.AP_MESH_TOPOLOGY)

  const apMeshListPayload = {
    fields: ['name', 'serialNumber', 'apMac', 'downlink', 'apDownRssis', 'uplink', 'apUpRssi',
      'meshRole', 'hops', 'apRssis', 'xPercent', 'yPercent', 'floorplanId'],
    filters: {
      meshRole: [APMeshRole.RAP, APMeshRole.MAP, APMeshRole.EMAP],
      venueId: [venueId]
    }
  }
  // eslint-disable-next-line max-len
  const { apMeshTopologyDeviceList } = useGetFloorPlanMeshApsQuery({ params, payload: apMeshListPayload }, {
    selectFromResult ({ data }) {
      return {
        apMeshTopologyDeviceList: data && flatApMeshList(data.data)
      }
    },
    skip: !isApMeshTopologyFFOn
  })

  const { data: apMeshTopologyData } = useGetApMeshTopologyQuery({
    params: { tenantId: params.tenantId, venueId }
  }, {
    skip: !isApMeshTopologyFFOn
  })

  const {
    meshDeviceList,
    meshLinkList
  } = filterByFloorplan(apMeshTopologyDeviceList, apMeshTopologyData?.edges, floorplanId)

  return isApMeshTopologyFFOn
    ? <ApMeshTopologyContext.Provider
      value={{
        isApMeshTopologyEnabled,
        meshDeviceList,
        meshLinkList
      }}
      children={children}
    />
    : children
}

function flatApMeshList (apMeshList: FloorPlanMeshAP[]): ApMeshTopologyDevice[] {
  const newList: ApMeshTopologyDevice[] = []

  apMeshList.forEach(apMesh => convertToMeshTopologyDevice(apMesh, null, newList))

  return newList
}

function convertToMeshTopologyDevice (
  apMesh: FloorPlanMeshAP,
  rootApMesh: FloorPlanMeshAP | null,
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

function isApUnplaced (apMesh: FloorPlanMeshAP): boolean {
  return _.isEmpty(apMesh.floorplanId)
}

function filterByFloorplan (
  incomingMeshDeviceList: ApMeshTopologyDevice[] | undefined,
  incomingMeshLinkList: ApMeshLink[] | undefined,
  floorplanId: string
): Pick<ApMeshTopologyContextProps, 'meshDeviceList' | 'meshLinkList'> {

  let filteredMeshDeviceList: ApMeshTopologyDevice[]
  if (incomingMeshDeviceList) {
    filteredMeshDeviceList = incomingMeshDeviceList.filter(ap => ap.floorplanId === floorplanId)
  } else {
    filteredMeshDeviceList = []
  }

  let filteredMeshLinkList: ApMeshLink[]
  if (incomingMeshLinkList) {
    filteredMeshLinkList = incomingMeshLinkList.filter((apMeshLink: ApMeshLink) => {
      return filteredMeshDeviceList.find(m => m.serialNumber === apMeshLink.from) &&
        filteredMeshDeviceList.find(m => m.serialNumber === apMeshLink.to)
    })
  } else {
    filteredMeshLinkList = []
  }

  return {
    meshDeviceList: filteredMeshDeviceList,
    meshLinkList: filteredMeshLinkList
  }
}
