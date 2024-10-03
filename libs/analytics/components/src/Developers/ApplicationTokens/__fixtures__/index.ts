export const applicationTokens = Array(10).fill(null).map((_, index) => ({
  id: `00000000-0000-0000-0000-00000000000${index}`,
  name: `token-${index}`,
  clientId: `00000000-0000-0000-0000-00000000000${index}`,
  clientSecret: `10000000-0000-0000-0000-00000000000${index}`,
  grantTypes: ['client_credentials'],
  accessTokenTtl: index
}))