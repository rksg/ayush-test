import { defineMessage } from 'react-intl'

import { PinDetailTableGroupTabType } from '../type'

export const diagramItemInfo = [{
  id: 'identity',
  controlFrame: {
    id: 'identityFrame',
    type: PinDetailTableGroupTabType.IDENTITY,
    attr: { x: 0, y: 65, width: '75px', height: '60px' }
  },
  label: {
    id: 'identityLabel',
    text: defineMessage({ defaultMessage: 'Identity' }),
    attr: { x: 5, y: 150 }
  }
}, {
  id: 'network',
  controlFrame: {
    id: 'networkFrame',
    type: PinDetailTableGroupTabType.NETWORK,
    attr: { x: 75, y: 20, width: '50px', height: '65px' }
  },
  label: {
    id: 'networkLabel',
    text: defineMessage({ defaultMessage: 'Network' }),
    attr: { x: 80, y: 10 }
  }
}, {
  id: 'ap',
  controlFrame: {
    id: 'apFrame',
    type: PinDetailTableGroupTabType.AP,
    attr: { x: 125, y: 60, width: '85px', height: '60px' }
  },
  label: {
    id: 'apLabel',
    text: defineMessage({ defaultMessage: 'AP' }),
    attr: { x: 155, y: 150 }
  }
}, {
  id: 'accessSwitch',
  controlFrame: {
    id: 'accessSwitchFrame',
    type: PinDetailTableGroupTabType.AS,
    attr: { x: 255, y: 60, width: '90px', height: '60px' }
  },
  label: {
    id: 'accessSwitchLabel',
    text: defineMessage({ defaultMessage: 'Access Switch' }),
    attr: { x: 255, y: 150 }
  }
}, {
  id: 'distributionSwitch',
  controlFrame: {
    id: 'distributionSwitchFrame',
    type: PinDetailTableGroupTabType.DS,
    attr: { x: 395, y: 60, width: '90px', height: '60px' }
  },
  label: {
    id: 'distributionSwitchLabel',
    text: defineMessage({ defaultMessage: 'Dist. Switch' }),
    attr: { x: 400, y: 150 }
  }
}, {
  id: 'edge',
  label: {
    id: 'edgeLabel',
    text: defineMessage({ defaultMessage: 'RUCKUS Edge' }),
    attr: { x: 535, y: 150 }
  }
}]