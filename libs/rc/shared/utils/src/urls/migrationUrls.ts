import { ApiInfo } from '@acx-ui/utils'

export const MigrationUrlsInfo: { [key: string]: ApiInfo } = {
  uploadZdConfig: {
    method: 'post',
    url: '/zdConfigurations',
    oldUrl: '/zd/migration/upload',
    newApi: true
  },
  addZdMigration: {
    method: 'post',
    url: '/zdConfigurations/:id',
    oldUrl: '/zd/migration/:id',
    newApi: true
  },
  getZdMigrationList: {
    method: 'get',
    url: '/zd/migration',
    oldUrl: '/zd/migration',
    newApi: true
  },
  getMigrationResult: {
    method: 'get',
    url: '/zdConfigurations/:id',
    oldUrl: '/zd/migration/:id',
    newApi: false
  },
  deleteMigration: {
    method: 'delete',
    url: '/zdConfigurations/:id',
    oldUrl: '/zd/migration/:id',
    newApi: true
  },
  getZdConfigurationList: {
    method: 'post',
    url: '/zdConfigurations/query',
    oldUrl: '/zdConfigurations/query',
    newApi: true
  },
  getZdConfiguration: {
    method: 'get',
    url: '/zdConfigurations/:id/query',
    oldUrl: '/zdConfigurations/:id/query',
    newApi: true
  },
  getZdConfigurationResult: {
    method: 'post',
    url: '/zdConfigurations/:id/results/query',
    oldUrl: '/zdConfigurations/:id/results/query',
    newApi: true
  }
}
