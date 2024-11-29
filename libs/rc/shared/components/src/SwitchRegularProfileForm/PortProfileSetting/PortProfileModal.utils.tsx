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
    // Convert models to a sorted string to ensure consistent grouping
    const modelsKey = profile.models.slice().sort().join(',')

    // If this group doesn't exist, create it
    if (!acc[modelsKey]) {
      acc[modelsKey] = {
        models: profile.models,
        portProfileId: []
      }
    }

    // Add the portProfileId to the group
    acc[modelsKey].portProfileId.push(profile.portProfileId)

    return acc
  }, {} as Record<string, { models: string[], portProfileId: string[] }>)

  // Convert the grouped profiles object to an array
  return Object.values(groupedProfiles)
}

export const portProfilesAPIParser = (parsedProfiles: PortProfileUI[]) => {
  // Flatten the parsed profiles back to the original structure
  return parsedProfiles.flatMap(profile =>
    profile.portProfileId.map((profileId: string) => ({
      id: profile.id,
      models: profile.models,
      portProfileId: profileId
    }))
  )
}