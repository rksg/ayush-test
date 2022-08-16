import { get } from 'lodash'

import {
  NetworkTypeEnum,
  CreateNetworkFormFields,
  OpenNetwork,
  AAANetwork,
  GuestNetwork,
  DpskNetwork,
  PassphraseFormatEnum,
  PassphraseExpirationEnum,
  Radius
} from '@acx-ui/rc/utils'

const parseAaaSettingDataToSave = (data: CreateNetworkFormFields) => {
  let saveData = new AAANetwork()

  if (data.isCloudpathEnabled) {
    saveData.cloudpathServerId = data.cloudpathServerId
    saveData.enableAccountingProxy = false
    saveData.enableAuthProxy = false
  } else {
    let authRadius = new Radius()
    if (get(data, 'authRadius.primary.ip')) {
      authRadius = {
        ...authRadius,
        ...{
          primary: {
            ip: get(data, 'authRadius.primary.ip'),
            port: Number(get(data, 'authRadius.primary.port')),
            sharedSecret: get(data, 'authRadius.primary.sharedSecret')
          }
        }
      }
    }
    if (data.enableSecondaryAuthServer) {
      authRadius = {
        ...authRadius,
        ...{
          secondary: {
            ip: get(data, 'authRadius.secondary.ip'),
            port: Number(get(data, 'authRadius.secondary.port')),
            sharedSecret: get(data, 'authRadius.secondary.sharedSecret')
          }
        }
      }
    }

    saveData.enableAuthProxy = data.enableAuthProxy
    saveData.authRadius = authRadius

    if (data.enableAccountingService) {
      let accountingRadius = new Radius()
      accountingRadius = {
        ...accountingRadius,
        ...{
          primary: {
            ip: get(data, 'accountingRadius.primary.ip'),
            port: Number(get(data, 'accountingRadius.primary.port')),
            sharedSecret: get(data, 'accountingRadius.primary.sharedSecret')
          }
        }
      }

      if (data.enableSecondaryAcctServer) {
        accountingRadius = {
          ...accountingRadius,
          ...{
            secondary: {
              ip: get(data, 'accountingRadius.secondary.ip'),
              port: Number(get(data, 'accountingRadius.secondary.port')),
              sharedSecret: get(
                data,
                'accountingRadius.secondary.sharedSecret'
              )
            }
          }
        }
      }

      saveData.enableAccountingProxy = data.enableAccountingProxy
      saveData.accountingRadius = accountingRadius
    }
  }

  return saveData
}

const parseOpenSettingDataToSave = (data: CreateNetworkFormFields) => {
  let saveData = new OpenNetwork()

  if (data.cloudpathServerId) {
    saveData.cloudpathServerId = data.cloudpathServerId
  }

  return saveData
}

const parseCaptivePortalDataToSave = (data: CreateNetworkFormFields) => {
  let saveData = new GuestNetwork()
  saveData.type = data.type
  saveData.guestPortal = { ...data.guestPortal }
  return saveData
}

const parseDpskSettingDataToSave = (data: CreateNetworkFormFields) => {
  let saveData = new DpskNetwork()

  saveData.dpskPassphraseGeneration = {
    length: data.passphraseLength as number,
    format: data.passphraseFormat as PassphraseFormatEnum,
    expiration: data.expiration as PassphraseExpirationEnum
  }

  if (data.cloudpathServerId) {
    saveData.cloudpathServerId = data.cloudpathServerId
  }

  return saveData
}

export function transferDetailToSave (data: CreateNetworkFormFields) {
  return {
    name: data.name,
    description: data.description ?? '',
    venues: data.venues ?? null,
    type: data.type,
    wlan: {
      ssid: data.name
    }
  }
}

export function tranferSettingsToSave (data: CreateNetworkFormFields) {
  const networkSaveDataParser = {
    [NetworkTypeEnum.AAA]: parseAaaSettingDataToSave(data),
    [NetworkTypeEnum.OPEN]: parseOpenSettingDataToSave(data),
    [NetworkTypeEnum.DPSK]: parseDpskSettingDataToSave(data),
    [NetworkTypeEnum.CAPTIVEPORTAL]: parseCaptivePortalDataToSave(data) 
  }
  return networkSaveDataParser[data.type as keyof typeof networkSaveDataParser]
}