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

  const actionRunner = (current: SoftGreProfileDispatcher, next: SoftGreProfileDispatcher) => {
    console.log('actionRunner Before', current)
    console.log(pendingLanPortChanges.current)
    const pendingChanges = pendingLanPortChanges.current
    const isPendingChangesEmpty = _.isEmpty(pendingChanges)
    const model = selectedModel.model
    const existedModelChanges = pendingChanges.find((change) => change.model === model)
    switch(next.state){
      case SoftGreState.TurnOnSoftGre:
        const turnOnChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: true,
            softGreProfileId: form.getFieldValue(['lan', next.index, 'softGreProfileId'])
          }
        }
        if (isPendingChangesEmpty || !existedModelChanges) {
          console.log('no exist change')
          pendingLanPortChanges.current = [
            ...pendingChanges,
            ...[{
              model: model,
              lanPorts: [turnOnChange]
            }]
          ]
        }
        if (existedModelChanges) {
          let changeNotFound = true
          let newLanPortsChangesList = existedModelChanges?.lanPorts.map((lanPort) => {
            if(lanPort.lanPortId === next.portId) {
              changeNotFound = false
              _.set(lanPort, ['venueLanPortSettings','softGreEnabled'], true)
              // eslint-disable-next-line
              _.set(
                lanPort,
                ['venueLanPortSettings','softGreProfileId'],
                form.getFieldValue(['lan', next.index, 'softGreProfileId'])
              )
            }
            return lanPort
          })
          if (changeNotFound){
            console.log('changeNotFound')
            newLanPortsChangesList?.push(turnOnChange)
          }
          existedModelChanges.lanPorts = newLanPortsChangesList
        }
        break
      case SoftGreState.TurnOffSoftGre:
        console.log('SoftGreState.TurnOffSoftGre')
        console.log(next)
        const turnOffChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: false
          }
        }
        if (isPendingChangesEmpty || !existedModelChanges) {
          console.log('no exist change')
          pendingLanPortChanges.current = [
            ...pendingChanges,
            ...[{
              model: model,
              lanPorts: [turnOffChange]
            }]
          ]
        }
        if (existedModelChanges) {
          existedModelChanges.lanPorts = existedModelChanges?.lanPorts.map((lanPort) => {
            if (lanPort.lanPortId === next.portId) {
              _.set(lanPort, ['venueLanPortSettings','softGreEnabled'], false)
              console.log('modify - change found')
              console.log(selectedModel)
              console.log(lanPort)
            }
            return lanPort
          })
        }
        break
      case SoftGreState.ModifySoftGreProfile:
        console.log('SoftGreState.ModifySoftGreProfile')
        const modifySoftGreProfileChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: true,
            softGreProfileId: form.getFieldValue(['lan', next.index, 'softGreProfileId'])
          }
        }
        if (isPendingChangesEmpty || !existedModelChanges) {
          console.log('no exist change')
          pendingLanPortChanges.current = [
            ...pendingChanges,
            ...[{
              model: model,
              lanPorts: [modifySoftGreProfileChange]
            }]
          ]
        }
        if (existedModelChanges) {
          existedModelChanges.lanPorts = existedModelChanges?.lanPorts.map((lanPort) => {
            if (lanPort.lanPortId === next.portId) {
              // eslint-disable-next-line
              _.set(lanPort, ['venueLanPortSettings','softGreProfileId'], form.getFieldValue(['lan', next.index, 'softGreProfileId']))
              console.log('modify - change found')
              console.log(lanPort)
            }
            return lanPort
          })
        }
        break
      case SoftGreState.TurnOnAndModifyDHCPOption82Settings:
        console.log('SoftGreState.TurnOnAndModifyDHCPOption82Settings')
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
        if (isPendingChangesEmpty || !existedModelChanges) {
          console.log('no exist change')
          pendingLanPortChanges.current = [
            ...pendingChanges,
            ...[{
              model: model,
              lanPorts: [turnOnDHCPOption82Change]
            }]
          ]
        }
        if (existedModelChanges) {
          let changeNotFound = true
          let newLanPortsChangesList = existedModelChanges?.lanPorts.map((lanPort) => {
            if(lanPort.lanPortId === next.portId) {
              changeNotFound = false
              _.set(lanPort, ['venueLanPortSettings','softGreSettings','dhcpOption82Enabled'], true)
              // eslint-disable-next-line
              _.set(
                lanPort,
                ['venueLanPortSettings','softGreSettings','dhcpOption82Settings'],
                form.getFieldValue(['lan', next.index, 'dhcpOption82', 'dhcpOption82Settings'])
              )
            }
            return lanPort
          })
          if (changeNotFound){
            console.log('changeNotFound')
            newLanPortsChangesList?.push(turnOnDHCPOption82Change)
          }
          existedModelChanges.lanPorts = newLanPortsChangesList
        }
        break
      case SoftGreState.TurnOffDHCPOption82:
        console.log('SoftGreState.TurnOffDHCPOption82')
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
        if (isPendingChangesEmpty || !existedModelChanges) {
          console.log('no exist change')
          pendingLanPortChanges.current = [
            ...pendingChanges,
            ...[{
              model: model,
              lanPorts: [turnOffDHCPOption82Change]
            }]
          ]
        }
        if (existedModelChanges) {
          let changeNotFound = true
          let newLanPortsChangesList = existedModelChanges?.lanPorts.map((lanPort) => {
            if(lanPort.lanPortId === next.portId) {
              changeNotFound = false
              // eslint-disable-next-line
              _.set(lanPort, ['venueLanPortSettings','softGreSettings','dhcpOption82Enabled'], false)
              _.unset(lanPort, ['venueLanPortSettings','softGreSettings','dhcpOption82Settings'])
            }
            return lanPort
          })
          if (changeNotFound){
            console.log('changeNotFound')
            newLanPortsChangesList?.push(turnOffDHCPOption82Change)
          }
          existedModelChanges.lanPorts = newLanPortsChangesList
        }
        break
      case SoftGreState.TurnOnLanPort:
        console.log('SoftGreState.TurnOnLanPort')
        console.log(form.getFieldValue(['lan', next.index, 'dhcpOption82Settings']))
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
        if (isPendingChangesEmpty || !existedModelChanges) {
          console.log('no exist change')
          pendingLanPortChanges.current = [
            ...pendingChanges,
            ...[{
              model: model,
              lanPorts: [turnOnLanPortChange]
            }]
          ]
        }
        if (existedModelChanges) {
          let changeNotFound = true
          let newLanPortsChangesList = existedModelChanges?.lanPorts.map((lanPort) => {
            if(lanPort.lanPortId === next.portId) {
              changeNotFound = false
              _.set(lanPort, ['lanPortEnable'], true)
              _.set(lanPort, ['venueLanPortSettings','softGreEnabled'], softGreEnabled)
              _.set(lanPort, ['venueLanPortSettings', 'softGreProfileId'], softGreProfileId
              )
            }
            return lanPort
          })
          if (changeNotFound){
            console.log('changeNotFound')
            newLanPortsChangesList?.push(turnOnLanPortChange)
          }
          existedModelChanges.lanPorts = newLanPortsChangesList
        }
        break
      case SoftGreState.TurnOffLanPort:
        console.log('SoftGreState.TurnOffLanPort')
        const turnOffLanPortChange: SoftGreLanPortChange = {
          lanPortId: next.portId!,
          venueLanPortSettings: {
            softGreEnabled: false
          },
          lanPortEnable: false
        }
        if (isPendingChangesEmpty || !existedModelChanges) {
          console.log('no exist change')
          pendingLanPortChanges.current = [
            ...pendingChanges,
            ...[{
              model: model,
              lanPorts: [turnOffLanPortChange]
            }]
          ]
        }
        if (existedModelChanges) {
          let changeNotFound = true
          let newLanPortsChangesList = existedModelChanges?.lanPorts.map((lanPort) => {
            if(lanPort.lanPortId === next.portId) {
              changeNotFound = false
              // eslint-disable-next-line
              _.set(lanPort, ['lanPortEnable'], false)
            }
            return lanPort
          })
          if (changeNotFound){
            console.log('changeNotFound')
            newLanPortsChangesList?.push(turnOffLanPortChange)
          }
          existedModelChanges.lanPorts = newLanPortsChangesList
        }
        break
      default:
        console.error(`Invalid action: ${next}`) // eslint-disable-line no-console
        break
    }
    console.log('actionrunner After change')
    console.log(pendingLanPortChanges.current)
    return next
  }
  // eslint-disable-next-line
  const [state, dispatch] = useReducer(actionRunner, { state: SoftGreState.Init, portId: '0', index: 0 })

  return { dispatch, handleUpdateSoftGreProfile }

}



