import { MessageDescriptor, defineMessage } from 'react-intl'

import { FriendlyNameEnum } from './constants'

export const friendlyNameEnumOptions: Record<FriendlyNameEnum, MessageDescriptor> = {
  [FriendlyNameEnum.CHI]: defineMessage({ defaultMessage: 'Chinese' }),
  [FriendlyNameEnum.CZE]: defineMessage({ defaultMessage: 'Czech' }),
  [FriendlyNameEnum.DAN]: defineMessage({ defaultMessage: 'Danish' }),
  [FriendlyNameEnum.DUT]: defineMessage({ defaultMessage: 'Dutch' }),
  [FriendlyNameEnum.ENG]: defineMessage({ defaultMessage: 'English' }),
  [FriendlyNameEnum.FRE]: defineMessage({ defaultMessage: 'France' }),
  [FriendlyNameEnum.GER]: defineMessage({ defaultMessage: 'German' }),
  [FriendlyNameEnum.JPN]: defineMessage({ defaultMessage: 'Japan' }),
  [FriendlyNameEnum.KOR]: defineMessage({ defaultMessage: 'Korea' }),
  [FriendlyNameEnum.SPA]: defineMessage({ defaultMessage: 'Spainish' }),
  [FriendlyNameEnum.SWE]: defineMessage({ defaultMessage: 'Swedish' }),
  [FriendlyNameEnum.TUR]: defineMessage({ defaultMessage: 'Turkish' })
}