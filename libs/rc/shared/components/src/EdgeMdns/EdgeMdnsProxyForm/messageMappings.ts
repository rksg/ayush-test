/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMappings = {
  scope_clusters_table_description: defineMessage({ defaultMessage: 'Select the <venuePlural></venuePlural> and RUCKUS Edge clusters where the mDNS Proxy Service will be applied:' }),
  drawer_table_description: defineMessage({ defaultMessage: 'Activate the RUCKUS Edge clusters that the mDNS Proxy Service will be applied to at <venueSingular></venueSingular> “{venueName}”. It is suggested to only enable this service on a single cluster per service.' })
}
