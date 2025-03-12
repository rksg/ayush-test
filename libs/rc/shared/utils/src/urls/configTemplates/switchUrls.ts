import { ApiInfo } from '@acx-ui/utils'

export const SwitchConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getSwitchConfigProfile: {
    method: 'get',
    url: '/templates/switchProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addSwitchConfigProfile: {
    method: 'post',
    url: '/templates/switchProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateSwitchConfigProfile: {
    method: 'put',
    url: '/templates/switchProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteSwitchConfigProfile: {
    method: 'delete',
    url: '/templates/switchProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getSwitchConfigProfileList: {
    method: 'post',
    url: '/templates/switchProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getCliFamilyModels: {
    method: 'get',
    url: '/templates/cliProfiles/venues',
    newApi: true
  },
  associateWithVenue: {
    method: 'put',
    url: '/templates/venues/:venueId/switchProfiles/:profileId',
    newApi: true
  },
  disassociateWithVenue: {
    method: 'delete',
    url: '/templates/venues/:venueId/switchProfiles/:profileId',
    newApi: true
  },
  getSwitchConfigProfileRbac: {
    method: 'get',
    url: '/templates/switchProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  addSwitchConfigProfileRbac: {
    method: 'post',
    url: '/templates/switchProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'POST:/templates/switchProfiles'
  },
  updateSwitchConfigProfileRbac: {
    method: 'put',
    url: '/templates/switchProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'PUT:/templates/switchProfiles/{id}'
  },
  deleteSwitchConfigProfileRbac: {
    method: 'delete',
    url: '/templates/switchProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'DELETE:/templates/switchProfiles/{id}'
  },
  getSwitchConfigProfileListRbac: {
    method: 'post',
    url: '/templates/switchProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  }
}
