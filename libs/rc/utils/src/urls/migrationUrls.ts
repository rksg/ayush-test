import { ApiInfo } from '../apiService'

export const MigrationUrlsInfo: { [key: string]: ApiInfo } = {
  uploadZdConfig: {
    method: 'post',
    url: '/zd/migration/upload',
    oldUrl: '/zd/migration/upload',
    newApi: true
  },
  addZdMigration: {
    method: 'post',
    url: '/zd/migration/:id',
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
    url: '/zd/migration/:id',
    oldUrl: '/venues/aps/importResults',
    newApi: true
  },
  deleteMigration: {
    method: 'delete',
    url: '/zd/migration/:id',
    oldUrl: '/api/tenant/:tenantId/zd/migration/:id',
    newApi: true
  }
}
