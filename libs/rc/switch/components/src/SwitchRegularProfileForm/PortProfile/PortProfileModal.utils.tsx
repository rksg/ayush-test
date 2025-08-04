import {
  PortProfileAPI,
  PortProfileUI
} from '@acx-ui/rc/utils'

export interface PortsType {
  label: string,
  value: string
}

export const portProfilesUIParser = (portProfiles: PortProfileAPI[]) => {
  const groupedProfiles = portProfiles.reduce((acc, profile) => {
    const modelsKey = Array.isArray(profile.models) ?
      profile.models.slice().sort().join(',') : profile.models

    if (!acc[modelsKey]) {
      acc[modelsKey] = {
        id: profile.id || '',
        models: profile.models,
        portProfileId: []
      }
    }

    acc[modelsKey].portProfileId.push(profile.portProfileId)

    return acc
  }, {} as Record<string, { id: string, models: string[], portProfileId: string[] }>)

  return Object.values(groupedProfiles)
}

export const portProfilesAPIParser = (portProfiles: PortProfileUI) => {
  const result: PortProfileAPI[] = portProfiles.portProfileId.map(portId => ({
    id: portProfiles.id,
    models: portProfiles.models,
    portProfileId: portId
  }))

  return result
}