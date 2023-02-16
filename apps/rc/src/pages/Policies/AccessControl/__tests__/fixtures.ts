export const aclDetail = {
  l2AclPolicy: {
    id: '36ec4826b5da48cc8118eda83aa4080f',
    enabled: true
  },
  l3AclPolicy: {
    id: '233d3182a1aa49ee9f50aeb039347021',
    enabled: true
  },
  name: 'acl-test',
  id: 'c9c0667abfe74ab7803999a793fd2bbe'
}

export const aclList = [aclDetail]

export const aclResponse = {
  requestId: '7305b668-b40b-439f-ba25-05ba6d587333'
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
