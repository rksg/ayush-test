import { VenueExtended } from '@acx-ui/rc/utils'

import { transformVenueOverrideValueToDisplay } from './Venue'

describe('ConfigTemplateVenueOverride', () => {
  describe('transformVenueOverrideValueToDisplay', () => {
    it('should transform venue object to display values', () => {
      const venue: Partial<VenueExtended> = {
        name: 'Test Venue',
        description: 'A test venue description',
        address: {
          addressLine: '123 Test St',
          countryCode: 'US'
        }
      }
      const expectedOutput = [
        { name: 'Name', value: 'Test Venue' },
        { name: 'Description', value: 'A test venue description' },
        { name: 'Address', value: '123 Test St' },
        { name: 'Wi-Fi Country Code', value: 'United States' }
      ]
      const result = transformVenueOverrideValueToDisplay(venue)
      expect(result).toEqual(expectedOutput)
    })

    it('should exclude fields with undefined or null values', () => {
      const venue: Partial<VenueExtended> = {
        name: 'Test Venue',
        address: {
          addressLine: undefined,
          countryCode: 'XX'
        }
      }
      const expectedOutput = [
        { name: 'Name', value: 'Test Venue' }
      ]
      const result = transformVenueOverrideValueToDisplay(venue)
      expect(result).toEqual(expectedOutput)
    })

    it('should handle missing address gracefully', () => {
      const venue: Partial<VenueExtended> = {
        name: 'Test Venue',
        description: 'A test venue description'
      }
      const expectedOutput = [
        { name: 'Name', value: 'Test Venue' },
        { name: 'Description', value: 'A test venue description' }
      ]
      const result = transformVenueOverrideValueToDisplay(venue)
      expect(result).toEqual(expectedOutput)
    })
    it('should handle missing venue object gracefully', () => {
      const venue: Partial<VenueExtended> = {}
      const result = transformVenueOverrideValueToDisplay(venue)
      expect(result).toEqual([])
    })
  })
})
