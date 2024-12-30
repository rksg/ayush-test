/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMapping = {
  description: defineMessage({ defaultMessage:
    'The following list outlines the prerequisites for building a PIN service. The wizard will guide you through the steps to complete the entire PIN service setup.'
  })
}

export const prerequisiteListMessage = [
  {
    title: defineMessage({ defaultMessage: 'Property Management' }),
    tooltip: defineMessage({ defaultMessage: 'Property management allows for assigning units within a <venueSingular></venueSingular>, offering a personalized experience for users. It facilitates network segmentation, enabling customized access and security for different spaces or tenants\' identities.' }),
    steps: [
      { label: defineMessage({ defaultMessage: 'Enable <b>property management</b> at the <venueSingular></venueSingular> where you intend to segment the identities' }) },
      { label: defineMessage({ defaultMessage: 'Select / create an <b>identity group</b> associated with a <b>DPSK service</b> in this property' }) }
    ]
  }, {
    title: defineMessage({ defaultMessage: 'Edge Cluster' }),
    steps: [
      { label: defineMessage({ defaultMessage: 'Deploy a <b>Edge cluster</b> at the <venueSingular></venueSingular> where PIN will be activated' }) },
      { label: defineMessage({ defaultMessage: 'Configure <b>DHCP</b> on Edge Cluster' }) }
    ]
  }, {
    title: defineMessage({ defaultMessage: 'Wi-Fi (optional)' }),
    steps: [
      { label: defineMessage({ defaultMessage: 'Create and activate <b>DPSK networks</b> at the <venueSingular></venueSingular>, ensuring they use the selected DPSK service in the property management identity group' }) }
    ]
  }
]