/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMapping = {
  // TODO: should change `multipleFromAp` when AP compatibility enhancement.
  multipleFromAp: defineMessage({ defaultMessage:
    'The following features are not enabled on this access point due to firmware or device ' +
    'incompatibility. Please see the minimum firmware versions required below. Also note that ' +
    'not all features are available on all access points. You may upgrade your firmware from {apFwLink}'
  }),
  multipleFromEdge: defineMessage({ defaultMessage:
    'The following features are not enabled on this SmartEdge due to <b>firmware incompatibility</b>. '+
    'Please see the minimum firmware versions required below. '+
    'You may upgrade your firmware from {edgeFwLink}'
  }),
  multipleFromVenueAp: defineMessage({ defaultMessage:
    'Some features are not enabled on specific access points in this <venueSingular></venueSingular> due to ' +
    'firmware or device incompatibility. Please see the minimum firmware versions required below. ' +
    'Also note that not all features are available on all access points. You may upgrade your firmware from {apFwLink}'
  }),
  multipleFromVenueEdge: defineMessage({ defaultMessage:
    'The following features are unavailable on certain SmartEdges '+
    'in this <venueSingular></venueSingular> due to <b>firmware incompatibility</b>. '+
    'You can upgrade your SmartEdge firmware by selecting these features and choosing to update now or schedule an update below.'
  }),
  singleApFeature: defineMessage({ defaultMessage:
    'To use the <b>{featureName}</b> feature, ensure that the access points '+
    'meet the minimum required version and AP model support list below. You may upgrade your firmware from {apFwLink}'
  }),
  singleEdgeFeature: defineMessage({ defaultMessage:
    'To use the <b>{featureName}</b> feature completely, ensure that the SmartEdges '+
    'meet the minimum required version and model support list below: {edgeFwLink}'
  }),
  singleFeatureCrossDeviceType: defineMessage({ defaultMessage:
    'To enable the <b>{featureName}</b> feature completely, ensure that the {deviceTypes} '+
    'meet the minimum required version and model support list below:'
  }),
  multipleFeatureFromVenueAp: defineMessage({ defaultMessage:
    'Please ensure that the access points in the <venueSingular></venueSingular> (<b>{venueName}</b>) '+
    'meet the minimum required version and AP model support list below for both {featureNames} requirements. '+
    'You may upgrade your firmware from {apFwLink}'
  }),
  singleFromVenueAp: defineMessage({ defaultMessage:
    'To use the <b>{featureName}</b> feature, ensure that the access points '+
    'on the <venueSingular></venueSingular> (<b>{venueName}</b>) meet the minimum required version'+
    ' and AP model support list below. You may upgrade your firmware from {apFwLink}'
  }),
  singleFromVenueEdge: defineMessage({ defaultMessage:
    'To use the <b>{featureName}</b>, ensure that the <venueSingular></venueSingular> firmware version for SmartEdges '+
    'on the <venueSingular></venueSingular> (<b>{venueName}</b>) meet the minimum required version below. You may upgrade your firmware from {edgeFwLink}'
  })
}