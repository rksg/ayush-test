export interface VLANPoolPolicyType{
  id?: string,
  name: string,
  description?: string[],
  vlanMembers: string|string[],
  networkIds?: string[]
}

export interface VLANPoolAPGroup{
  apGroupId:string,
  apGroupName:string,
  apCount:number
}

export interface VLANPoolVenues{
  venueId?: string,
  venueName: string,
  apGroupData: VLANPoolAPGroup
}
