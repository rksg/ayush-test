export const generateDefaultNetworkVenue = (venueId: string, networkId:string) => {
  return {
    apGroups: [],
    scheduler: {
      type: 'ALWAYS_ON'
    },
    isAllApGroups: true,
    allApGroupsRadio: 'Both',
    allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
    venueId,
    networkId
  }
}