import { defineMessage } from 'react-intl'

export const poeCurPwrSrcEnumMap = {
  RKS_AP_PWR_SRC_UNKNOWN: defineMessage({ defaultMessage: 'Unknown' }),
  RKS_AP_PWR_SRC_DC: defineMessage({ defaultMessage: 'AC/DC Power supply' }),
  RKS_AP_PWR_SRC_AT: defineMessage({ defaultMessage: '802.3at Switch/Injector' }),
  RKS_AP_PWR_SRC_INJ: defineMessage({ defaultMessage: 'PoE Injector' }),
  RKS_AP_PWR_SRC_AF: defineMessage({ defaultMessage: '802.3af Switch/Injector' }),
  RKS_AP_PWR_SRC_AT_PLUS: defineMessage({ defaultMessage: '802.3at+ Switch/Injector' }),
  RKS_AP_PWR_SRC_BT6: defineMessage({ defaultMessage: '802.3bt/Class 6' }),
  RKS_AP_PWR_SRC_BT7: defineMessage({ defaultMessage: '802.3bt/Class 7' }),
  RKS_AP_PWR_SRC_BT8: defineMessage({ defaultMessage: '802.3bt/Class 8' })
}
