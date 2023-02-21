export const mockedRogueApPoliciesList = {
  fields: [
    'scope',
    'name',
    'health',
    'cog',
    'id',
    'technology',
    'check-all',
    'type',
    'tags'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'ebb16f640edf4272bc56aef4b37fb630',
      name: 'Default profile',
      type: 'Rogue AP Detection',
      technology: 'WI-FI',
      scope: 0
    },
    {
      id: 'c61fd92dc48b43239a4c1e00e0616302',
      name: 'roguePolicy1-rollback-1',
      type: 'Rogue AP Detection',
      technology: 'WI-FI',
      scope: 1
    }
  ]
}

export const emptyPoliciesList = {
  fields: [
    'scope',
    'name',
    'cog',
    'id',
    'type'
  ],
  totalCount: 0,
  page: 1,
  data: []
}
