import { find } from 'lodash'

import { emptyDualWanSettings }                            from '@acx-ui/edge/components'
import {
  getEdgeWanInterfaces, ClusterNetworkMultiWanSettings,
  EdgePort, EdgeLag, EdgeWanMember, EdgeMultiWanModeEnum
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { InterfaceSettingsFormType } from '../types'

export const getDisplayPortString = (nodeName:string, portName: string) => {
  return (nodeName || portName) ? `${nodeName} / ${portName}` : ''
}

export const getDisplayWanRole = (priority: number) => {
  const { $t } = getIntl()
  if (priority === 0) return ''
  return priority === 1 ? $t({ defaultMessage: 'Active' }) : $t({ defaultMessage: 'Backup' })
}

export const getDualWanDataFromClusterWizard = (
  formData: InterfaceSettingsFormType | undefined
): ClusterNetworkMultiWanSettings | undefined => {

  if(!formData) return undefined

  const portSettings = formData.portSettings
  const nodeSnList = Object.keys(portSettings)

  // only handle single-node case
  if (nodeSnList.length === 1) {

    // eslint-disable-next-line max-len
    const ports = Object.values((portSettings[nodeSnList[0]]) as { [portId:string]: EdgePort[] }).flat()
    const lags = formData.lagSettings[0].lags ?? []
    const wans = getEdgeWanInterfaces(ports as EdgePort[], lags as EdgeLag[])

    // clear dualWanSettings if WAN count < 2
    if (wans.length < 2) {
      return emptyDualWanSettings
    }

    const currentMembers = formData?.multiWanSettings?.wanMembers

    let resultWanMembers: EdgeWanMember[] = new Array(wans.length)
    const newAddMembers: EdgeWanMember[] = []

    // check if wan interface different from those in currentMembers
    // wan interface changed, reset multiWanSettings
    // if not changed, keep its current settings
    wans.forEach((wanInterface) => {
      const existMember = wanInterface.hasOwnProperty('interfaceName')
        ? find(currentMembers, { portName: (wanInterface as EdgePort).interfaceName })
        : find(currentMembers, { portName: `lag${(wanInterface as EdgeLag).id}` })

      if (existMember) {
        if (existMember.priority) {
          resultWanMembers[existMember.priority - 1] = existMember
        } else {
          newAddMembers.push(existMember)
        }
      } else {
        newAddMembers.push({
          serialNumber: nodeSnList[0],
          portName: wanInterface.hasOwnProperty('interfaceName')
            ? ((wanInterface as EdgePort).interfaceName as string)
            : `lag${(wanInterface as EdgeLag).id}`,
          priority: 0,
          healthCheckEnabled: false,
          linkHealthCheckPolicy: undefined
        })
      }
    })

    // fill new members into empty priority positions
    if (newAddMembers.length > 0) {
      for (let idx = 0; idx < resultWanMembers.length; idx++) {
        if (!resultWanMembers[idx]) {
          const newMember = newAddMembers.shift()
          if (newMember) {
            resultWanMembers[idx] = newMember
          }
        }
      }
    }

    resultWanMembers = resultWanMembers
    // might be undefined when new WAN members count !== original WAN members count
      .filter(i => !!i)
      // rearrange priority
      .map((item, idx) => ({
        ...item,
        priority: idx+1
      }))

    return {
      mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
      wanMembers: resultWanMembers
    }
  } else {
    // clear dualWanSettings if cluster is multi-nodes
    return emptyDualWanSettings
  }
}