export const aclList = {
  data: [
    {
      aclRules: [
        {
          action: 'permit',
          destination: 'any',
          id: '22cc1bbd9d1044949a05df547212b517',
          protocol: undefined,
          sequence: 65000,
          source: 'any'
        },
        {
          action: 'permit',
          destination: 'any',
          id: 'b667183977084faf92f7d9355e4b9eb0',
          protocol: 'ip',
          sequence: 33,
          source: 'any'
        }
      ],
      aclType: 'extended',
      id: 'd33953810d0d4f37a1e5442d223dc768',
      name: 'extended-acl'
    },
    {
      aclRules: [
        {
          action: 'permit',
          id: '5dce0e87f91040f4b1c8f93bc326a45d',
          protocol: 'ip',
          sequence: 65000,
          source: 'any'
        },
        {
          action: 'permit',
          id: 'a468fe1e70344d74898cd9689f11cf9a',
          protocol: 'ip',
          sequence: 9,
          source: '1.1.1.0/24'
        },
        {
          action: 'deny',
          id: '684f0d62425147769a755b758cef8843',
          protocol: 'ip',
          sequence: 5,
          source: 'any'
        }
      ],
      aclType: 'standard',
      id: '24ef915a476947ec9fb1fe37feecab0e',
      name: 'standard-acl'
    }
  ],
  page: 1,
  totalCount: 2,
  totalPages: 1
}
