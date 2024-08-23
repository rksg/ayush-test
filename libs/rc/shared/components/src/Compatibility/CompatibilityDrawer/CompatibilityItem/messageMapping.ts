/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMapping = {
  multipleFromAp: defineMessage({ defaultMessage:
    'The following features are not enabled on this access point due to firmware or device ' +
    'incompatibility. Please see the minimum firmware versions required below. Also note that ' +
    'not all features are available on all access points. You may upgrade your firmware from {apFwLink}'
  }),
  multipleFromEdge: defineMessage({ defaultMessage:
    'The following features are not enabled on this SmartEdge due to firmware or device ' +
    'incompatibility. Please see the minimum firmware versions required below. Also note that ' +
    'not all features are available on all SmartEdges. You may upgrade your firmware from {edgeFwLink}'
  }),
  multipleFromVenueAp: defineMessage({ defaultMessage:
    'Some features are not enabled on specific access points in this <venueSingular></venueSingular> due to ' +
    'firmware or device incompatibility. Please see the minimum firmware versions required below. ' +
    'Also note that not all features are available on all access points. You may upgrade your firmware from {apFwLink}'
  }),
  multipleFromVenueEdge: defineMessage({ defaultMessage:
    'The following features are unavailable on specific SmartEdges in this <venueSingular></venueSingular> due to <b>firmware incompatibility</b>.' +
    'To enable these features, please upgrade your firmware to the minimum required version under {edgeFwLink}'
  }),
  singleApFeature: defineMessage({ defaultMessage:
    'To utilize the <b>{featureName}</b>, ensure that the access points meet the minimum '+
    'required version and AP model support list below. You may upgrade your firmware from {apFwLink}'
  }),
  singleEdgeFeature: defineMessage({ defaultMessage:
    'To utilize the <b>{featureName}</b>, ensure that the SmartEdges meet the minimum '+
    'required version. You may upgrade your firmware from {edgeFwLink}'
  }),
  singleFromVenueAp: defineMessage({ defaultMessage:
    'To utilize the <b>{featureName}</b>, ensure that the access points on the <venueSingular></venueSingular> ' +
    '(<b>{venueName}</b>) meet the minimum required version and AP model support list below. You may upgrade your firmware from {apFwLink}'
  }),
  singleFromVenueEdge: defineMessage({ defaultMessage:
    'To utilize the <b>{featureName}</b>, ensure that the SmartEdges on the <venueSingular></venueSingular> ' +
    '(<b>{venueName}</b>) meet the minimum required version and AP model support list below. You may upgrade your firmware from {edgeFwLink}'
  })
}
