import { useReducer, useRef } from 'react'

import { Form } from 'antd'
import _        from 'lodash'

import {
  useActivateSoftGreProfileOnVenueMutation,
  useDeactivateSoftGreProfileOnVenueMutation
} from '@acx-ui/rc/services'
import {
  LanPort, LanPortSoftGreProfileSettings,
  SoftGreChanges,
  SoftGreLanPortChange,
  SoftGreProfileDispatcher,
  SoftGreState,
  VenueLanPorts
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export const useSoftGreProfileActivation = (
  selectedModel: VenueLanPorts
) => {

  const { venueId } = useParams()

  const form = Form.useFormInstance()
  const [ activateSoftGre ] = useActivateSoftGreProfileOnVenueMutation()
  const [ deactivateSoftGre ] = useDeactivateSoftGreProfileOnVenueMutation()
  const pendingLanPortChanges = useRef<SoftGreChanges[]>([])

  const handleUpdateSoftGreProfile = async (
    currentModel: string,
    currentLanPort: LanPort,
    originLanPort: LanPort | undefined
  ) => {

    const pendingChanges = pendingLanPortChanges.current
    const isPendingChangesEmpty = _.isEmpty(pendingChanges)
    const existedModelChanges = pendingChanges.find((change) => change.model === currentModel)
    const existedLanPortChanges = existedModelChanges?.lanPorts.find((lanPort) => {
      return lanPort.lanPortId === currentLanPort.portId
    })

    // Ignore when no change, no current model change, no current lan port change
    if (isPendingChangesEmpty || !existedModelChanges || !existedLanPortChanges) {
      return
    }

    // Ignore when lanPort on but SoftGre wasn't enabled.
    if(existedLanPortChanges.lanPortEnable === false && !originLanPort!.softGreProfileId) {
      return
    }

    // Deactivate when lan port turn off or SoftGre turn off
    if(existedLanPortChanges.lanPortEnable === false
    || !existedLanPortChanges.venueLanPortSettings.softGreEnabled) {
      await deactivateSoftGre({
        params: {
          venueId,
          apModel: currentModel,
          portId: currentLanPort.portId,
          policyId: originLanPort!.softGreProfileId
        }
      })
      return
    }

    if(existedLanPortChanges.venueLanPortSettings.softGreEnabled) {
      let payload = { dhcpOption82Enabled: false } as LanPortSoftGreProfileSettings
      if (existedLanPortChanges.venueLanPortSettings.softGreSettings?.dhcpOption82Enabled){
        payload = {
          dhcpOption82Enabled: true,
          dhcpOption82Settings:
            existedLanPortChanges.venueLanPortSettings.softGreSettings.dhcpOption82Settings
        }
      }

      await activateSoftGre({ params: {
        venueId,
        apModel: currentModel,
        portId: currentLanPort.portId,
        policyId: existedLanPortChanges.venueLanPortSettings.softGreProfileId
      }, payload
      })
      return
    }
  }

  const updatePendingLanPortChange = (
    nextChange: SoftGreLanPortChange,
    next: SoftGreProfileDispatcher,
    callback: (lanPort: SoftGreLanPortChange) => void
  ) => {
    const pendingChanges = pendingLanPortChanges.current
    const isPendingChangesEmpty = _.isEmpty(pendingChanges)
    const model = selectedModel.model
    const existedModelChanges = pendingChanges.find((change) => change.model === model)
    if (isPendingChangesEmpty || !existedModelChanges) {
      pendingLanPortChanges.current = [
        ...pendingChanges,
        ...[{
          model: model,
          lanPorts: [nextChange]
        }]
      ]
    }

    if (existedModelChanges) {
      let changeNotFound = true
      let newLanPortsChangesList = existedModelChanges?.lanPorts.map((lanPort) => {
        if(lanPort.lanPortId === next.portId) {
          changeNotFound = false
          callback(lanPort)
        }
        return lanPort
      })
      if (changeNotFound){
        newLanPortsChangesList?.push(nextChange)
      }
      existedModelChanges.lanPorts = newLanPortsChangesList
    }
  }

  const actionRunner = (current: SoftGreProfileDispatcher, next: SoftGreProfileDispatcher) => {
    switch(next.state){
      case SoftGreState.TurnOnSoftGre:
        const turnOnChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: true,
            softGreProfileId: form.getFieldValue(['lan', next.index, 'softGreProfileId'])
          }
        }
        const turnOnSoftGreCallback = (lanPort: SoftGreLanPortChange) => {
          _.set(lanPort, ['venueLanPortSettings','softGreEnabled'], true)
          _.set(
            lanPort,
            ['venueLanPortSettings','softGreProfileId'],
            form.getFieldValue(['lan', next.index, 'softGreProfileId'])
          )
        }
        updatePendingLanPortChange(turnOnChange, next, turnOnSoftGreCallback)
        break
      case SoftGreState.TurnOffSoftGre:
        const turnOffChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: false
          }
        }
        const turnOffSoftGreCallback = (lanPort: SoftGreLanPortChange) => {
          _.set(lanPort, ['venueLanPortSettings','softGreEnabled'], false)
        }
        updatePendingLanPortChange(turnOffChange, next, turnOffSoftGreCallback)
        break
      case SoftGreState.ModifySoftGreProfile:
        const modifySoftGreProfileChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: true,
            softGreProfileId: form.getFieldValue(['lan', next.index, 'softGreProfileId'])
          }
        }
        const modifySoftGreProfileCallback = (lanPort: SoftGreLanPortChange) => {
          _.set(
            lanPort,
            ['venueLanPortSettings','softGreProfileId'],
            form.getFieldValue(['lan', next.index, 'softGreProfileId'])
          )
        }
        updatePendingLanPortChange(modifySoftGreProfileChange, next, modifySoftGreProfileCallback)
        break
      case SoftGreState.TurnOnAndModifyDHCPOption82Settings:
        const turnOnDHCPOption82Change: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: true,
            softGreProfileId: form.getFieldValue(['lan', next.index, 'softGreProfileId']),
            softGreSettings: {
              dhcpOption82Enabled: true,
              // eslint-disable-next-line max-len
              dhcpOption82Settings: form.getFieldValue(['lan', next.index, 'dhcpOption82Settings'])
            }
          }
        }
        const turnOnDHCPOption82Callback = (lanPort: SoftGreLanPortChange) => {
          _.set(lanPort, ['venueLanPortSettings','softGreSettings','dhcpOption82Enabled'], true)
          _.set(
            lanPort,
            ['venueLanPortSettings','softGreSettings','dhcpOption82Settings'],
            form.getFieldValue(['lan', next.index, 'dhcpOption82', 'dhcpOption82Settings'])
          )
        }
        updatePendingLanPortChange(turnOnDHCPOption82Change, next, turnOnDHCPOption82Callback)
        break
      case SoftGreState.TurnOffDHCPOption82:
        const turnOffDHCPOption82Change: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: true,
            softGreProfileId: form.getFieldValue(['lan', next.index, 'softGreProfileId']),
            softGreSettings: {
              dhcpOption82Enabled: true
            }
          }
        }
        const turnOffDHCPOption82Callback = (lanPort: SoftGreLanPortChange) => {
          // eslint-disable-next-line
          _.set(lanPort, ['venueLanPortSettings','softGreSettings','dhcpOption82Enabled'], false)
          _.unset(lanPort, ['venueLanPortSettings','softGreSettings','dhcpOption82Settings'])
        }
        updatePendingLanPortChange(turnOffDHCPOption82Change, next, turnOffDHCPOption82Callback)
        break
      case SoftGreState.TurnOnLanPort:
        const softGreProfileId = form.getFieldValue(['lan', next.index, 'softGreProfileId'])
        const softGreEnabled = !!softGreProfileId
        const turnOnLanPortChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: softGreEnabled,
            softGreProfileId: softGreProfileId
          },
          lanPortEnable: true
        }
        const turnOnLanPortCallback = (lanPort: SoftGreLanPortChange) => {
          _.set(lanPort, ['lanPortEnable'], true)
          _.set(lanPort, ['venueLanPortSettings','softGreEnabled'], softGreEnabled)
          _.set(lanPort, ['venueLanPortSettings', 'softGreProfileId'], softGreProfileId)
        }
        updatePendingLanPortChange(turnOnLanPortChange, next, turnOnLanPortCallback)
        break
      case SoftGreState.TurnOffLanPort:
        const turnOffLanPortChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: false
          },
          lanPortEnable: false
        }
        const turnOffLanPortCallback = (lanPort: SoftGreLanPortChange) => {
          _.set(lanPort, ['lanPortEnable'], false)
        }
        updatePendingLanPortChange(turnOffLanPortChange, next, turnOffLanPortCallback)
        break
      default:
        console.error(`Invalid action: ${next}`) // eslint-disable-line no-console
        break
    }
    return next
  }
  // eslint-disable-next-line
  const [state, dispatch] = useReducer(actionRunner, { state: SoftGreState.Init, portId: '0', index: 0 })

  return { dispatch, handleUpdateSoftGreProfile }

}



