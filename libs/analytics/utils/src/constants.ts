export const noDataSymbol = '-'

export enum NetworkNodeTypeForDisplay {
  network = 'Network',
  apGroupName = 'AP Group',
  apGroup = 'AP Group',
  zoneName = 'Venue',
  zone = 'Venue', // can be moved i18n translation later
  switchGroup = 'Venue',
  switch = 'Switch',
  apMac = 'Access Point',
  ap = 'Access Point',
  AP = 'Access Point' // since data-api sends AP
}
