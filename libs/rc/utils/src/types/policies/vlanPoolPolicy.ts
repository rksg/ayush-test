export interface VLANPoolPolicyType{
  id?: string,
  name: string,
  description?: string[],
  vlanMembers: string,
  networkIds?: string[]
}
export interface VLANPoolDetailInstances{
  id?: string,
  name: string,
  aps: number,
  scope: string

}
