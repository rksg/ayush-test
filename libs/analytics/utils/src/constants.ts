
export interface NetworkPath extends Array<{ type: string; name: string }> {}

export enum networkNodeTypeForDisplay {
  network = 'Network',
  apGroup = 'AP Group',
  zone = 'Venue', // can be moved i18n translation later
  switchGroup = 'Venue',
  switch = 'Switch',
  AP = 'Access Point' // since data-api sends AP
}