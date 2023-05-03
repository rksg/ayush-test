import { ApiInfo } from '../apiService'

export const MigrationUrlsInfo: { [key: string]: ApiInfo } = {
  getZdMigrationList: {
    method: 'get',
    url: '/aps/query',
    oldUrl: '/api/zd/migration',
    newApi: true
  },
  addZdMigration: {
    method: 'post',
    url: '/venues/aps',
    oldUrl: '/api/zd/migration',
    newApi: true
  },
  getMigrateResult: {
    method: 'get',
    url: '/venues/aps/importResults',
    oldUrl: '/venues/aps/importResults',
    newApi: true
  }
}
