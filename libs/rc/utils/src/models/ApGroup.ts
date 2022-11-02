
export class ApGroup {
  venueId: string

  // List of ApSerialNumber contaning AP Serial-Numbers for AP-Group association
  apSerialNumbers?: []

  name: string

  description?: string

  id?: string

  constructor () {
    this.venueId = ''

    this.apSerialNumbers = []

    this.name = ''
  }
}
