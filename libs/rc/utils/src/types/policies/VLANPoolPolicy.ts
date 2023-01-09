export interface VLANPoolPolicyType{
  id?: string,
  policyName: string,
  tags?: string[],
  vlans: string,
  networkIds?: string[]
}
export interface VLANPoolDetailInstances{
  id?: string,
  name: string,
  aps: number,
  scope: string

}
