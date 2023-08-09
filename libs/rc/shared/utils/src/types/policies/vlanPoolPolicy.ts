export interface VLANPoolPolicyType{
  id?: string,
  name: string,
  description?: string[],
  vlanMembers: string|string[],
  networkIds?: string[]
}
export interface VLANPoolViewModelType extends VLANPoolPolicyType {
  venueIds: string|string[],
  venueApGroups: VenueAPGroup[]
}
interface VenueAPGroup{
  id: string,
  apGroups:APGroup[]
}
interface APGroup{
  id: string,
  allApGroups: boolean,
  default: boolean
}
export interface VLANPoolAPGroup{
  apGroupId:string,
  apGroupName:string,
  apCount:number
}

export interface VLANPoolVenues{
  venueId?: string,
  venueName: string,
  apGroupData: VLANPoolAPGroup[]
}
