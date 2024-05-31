import { ApiInfo } from '@acx-ui/utils'

export const SwitchConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getSwitchConfigProfile: {
    method: 'get',
    url: '/templates/switchProfiles/:profileId',
    newApi: true
  },
  addSwitchConfigProfile: {
    method: 'post',
    url: '/templates/switchProfiles',
    newApi: true
  },
  updateSwitchConfigProfile: {
    method: 'put',
    url: '/templates/switchProfiles/:profileId',
    newApi: true
  },
  deleteSwitchConfigProfile: {
    method: 'delete',
    url: '/templates/switchProfiles/:templateId',
    newApi: true
  },
  getSwitchConfigProfileList: {
    method: 'post',
    url: '/templates/switchProfiles/query',
    newApi: true
  },
  getCliFamilyModels: {
    method: 'get',
    url: '/templates/cliProfiles/familyModels',
    newApi: true
  }
}
