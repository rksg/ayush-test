import { ApiInfo } from '@acx-ui/utils'


export const DirectoryServerUrls: { [key: string]: ApiInfo } = {
  createDirectoryServer: {
    method: 'post',
    url: '/directoryServerProfiles',
    opsApi: 'POST:/directoryServerProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getDirectoryServerViewDataList: {
    method: 'post',
    url: '/directoryServerProfiles/query',
    opsApi: 'POST:/directoryServerProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteDirectoryServer: {
    method: 'delete',
    url: '/directoryServerProfiles/:policyId',
    opsApi: 'DELETE:/directoryServerProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getDirectoryServer: {
    method: 'get',
    url: '/directoryServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateDirectoryServer: {
    method: 'put',
    url: '/directoryServerProfiles/:policyId',
    opsApi: 'PUT:/directoryServerProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateDirectoryServer: {
    method: 'put',
    url: '/wifiNetworks/:networkId/directoryServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  testConnectionDirectoryServer: {
    method: 'PATCH',
    url: '/directoryServer/diagnosisCommands',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
