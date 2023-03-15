export const aclDetail = {
  name: 'acl-test',
  id: 'c9c0667abfe74ab7803999a793fd2bbe'
}

export const enhancedAccessControlList = {
  fields: [
    'clientRateUpLinkLimit',
    'l3AclPolicyId',
    'applicationPolicyName',
    'clientRateDownLinkLimit',
    'devicePolicyName',
    'l2AclPolicyId',
    'networkIds',
    'name',
    'applicationPolicyId',
    'id',
    'l3AclPolicyName',
    'l2AclPolicyName',
    'devicePolicyId'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '7217d467353744d9aac8493324501be3',
      name: 'My Access Control 1',
      l2AclPolicyName: 'layer2-1',
      l2AclPolicyId: 'e621cd8aa3f84f2faf04635e59a5db7b',
      devicePolicyName: 'deviceos-policy-1',
      devicePolicyId: '77821b31782148b4ace261257166554e',
      clientRateUpLinkLimit: 138,
      clientRateDownLinkLimit: 0,
      networkIds: []
    }
  ]
}

export const aclList = [aclDetail]

export const aclResponse = {
  requestId: '7305b668-b40b-439f-ba25-05ba6d587333'
}

export const emptyListResponse = {
  data: [],
  fields: ['name', 'id'],
  totalCount: 0,
  totalPages: 1,
  page: 1
}

export const enhancedLayer2PolicyListResponse = {
  fields: [
    'macAddress',
    'networkIds',
    'name',
    'description',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'e621cd8aa3f84f2faf04635e59a5db7b',
      name: 'layer2-1',
      macAddress: '1',
      networkIds: []
    }
  ]
}

export const layer2PolicyListResponse = {
  data: [
    {
      id: '36ec4826b5da48cc8118eda83aa4080f',
      name: 'layer2policy1',
      macAddressesCount: 1,
      networksCount: 0
    }
  ],
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

export const layer2Response = {
  name: 'layer2policy1',
  access: 'BLOCK',
  macAddresses: [
    '55:55:55:55:55:55'
  ],
  id: '36ec4826b5da48cc8118eda83aa4080f'
}

export const enhancedLayer3PolicyListResponse = {
  fields: [
    'networkIds',
    'name',
    'description',
    'rules',
    'id'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '4279f73355044b8fa54e0e738188dc5c',
      name: 'layer3-1',
      networkIds: []
    },
    {
      id: 'b5b0d53279254885a497191670bd3a4b',
      name: 'layer3-2',
      networkIds: []
    }
  ]
}

export const layer3PolicyListResponse = {
  data: [
    {
      id: '233d3182a1aa49ee9f50aeb039347021',
      name: 'layer3policy1',
      rulesCount: 1,
      networksCount: 0
    }
  ],
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

export const layer3Response = {
  name: 'layer3policy1',
  defaultAccess: 'BLOCK',
  l3Rules: [
    {
      priority: 1,
      access: 'ALLOW',
      source: {
        enableIpSubnet: false
      },
      destination: {
        enableIpSubnet: false
      },
      id: '96b80fe415fe4131addbb1a6e967167d'
    }
  ],
  id: '233d3182a1aa49ee9f50aeb039347021'
}

export const enhancedApplicationPolicyListResponse = {
  fields: [
    'networkIds',
    'name',
    'description',
    'rules',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '8097d6206f094410ba09fb1cc81ddf5d',
      name: 'app5',
      networkIds: []
    }
  ]
}

export const applicationPolicyListResponse = {
  data: [
    {
      id: '8097d6206f094410ba09fb1cc81ddf5d',
      name: 'app-policy-1',
      rulesCount: 1,
      networksCount: 0
    }
  ],
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

export const enhancedDevicePolicyListResponse = {
  fields: [
    'networkIds',
    'name',
    'description',
    'rules',
    'id'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'dfe9cf68ab734513a46626da3f896574',
      name: 'dev1',
      networkIds: []
    },
    {
      id: '02d8e791fad34e54acd36b0adae6f59f',
      name: 'dev2-block',
      networkIds: []
    },
    {
      id: '84eb837c59e84761a1c836591d4be331',
      name: 'device-1',
      networkIds: []
    }
  ]
}

export const devicePolicyListResponse = {
  data: [
    {
      id: '84eb837c59e84761a1c836591d4be331',
      name: 'device-1',
      rulesCount: 1,
      networksCount: 0
    }
  ],
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}
