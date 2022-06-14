export function transferDetailToSave (data: any) {
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

export function tranferSettingsToSave (data: any) {
  let saveData = {}

  if(data.type === 'aaa'){
    saveData = {
      wlan: {
        wlanSecurity: data.wlanSecurity
      }
    }
    if (data.isCloudpathEnabled) {
      saveData = {
        ...saveData,
        ...{
          cloudpathServerId: data.cloudpathServerId,
          enableAccountingProxy: false,
          enableAuthProxy: false
        }
      }
    } else {
      let authRadius = {
        primary: {
          ip: data['authRadius.primary.ip'],
          port: data['authRadius.primary.port'],
          sharedSecret: data['authRadius.primary.sharedSecret']
        }
      }
      if (data['authRadius.secondary.ip']) {
        authRadius = {
          ...authRadius,
          ...{
            secondary: {
              ip: data['authRadius.secondary.ip'],
              port: data['authRadius.secondary.port'],
              sharedSecret: data['authRadius.secondary.sharedSecret']
            }
          }
        }
      }
  
      saveData = {
        ...saveData,
        ...{
          enableAccountingProxy: data.enableAccountingProxy,
          enableAuthProxy: data.enableAuthProxy,
          authRadius
        }
      }
  
      if (data.enableAccountingService === true) {
        let accountingRadius = {}
        accountingRadius = {
          ...accountingRadius,
          ...{
            primary: {
              ip: data['accountingRadius.primary.ip'],
              port: data['accountingRadius.primary.port'],
              sharedSecret: data['accountingRadius.primary.sharedSecret']
            }
          }
        }
  
        if (data['accountingRadius.secondary.ip']) {
          accountingRadius = {
            ...accountingRadius,
            ...{
              secondary: {
                ip: data['accountingRadius.secondary.ip'],
                port: data['accountingRadius.secondary.port'],
                sharedSecret: data['accountingRadius.secondary.sharedSecret']
              }
            }
          }
        }
  
        saveData = {
          ...saveData,
          ...{
            accountingRadius
          }
        }
      }
    }
  }else if(data.type === 'open'){
    if (data.cloudpathServerId) {
      saveData = {
        ...saveData,
        ...{
          cloudpathServerId: data.cloudpathServerId
        }
      }
    }
    saveData = {
      ...saveData,
      ...{
        wlan: {
          enable: true,
          vlanId: 1
        }
      }
    }
  }
  return saveData
}
  