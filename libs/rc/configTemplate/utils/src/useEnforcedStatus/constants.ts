import { createContext } from 'react'

import { defineMessage } from 'react-intl'

import { StepsFormLegacyProps, StepsFormProps }  from '@acx-ui/components'
import { ConfigTemplateType, EnforceableFields } from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export const enforcedActionMsg = defineMessage({ defaultMessage: 'Action is disabled due to enforcement from the template' })

export const ConfigTemplateEnforcementContext = createContext({} as EnforceableFields)

export type GetStepsFormProps<T> = T extends 'StepsForm'
  ? StepsFormProps
  : T extends 'StepsFormLegacy' ? StepsFormLegacyProps : never


export type AllowedEnforcedType =
  ConfigTemplateType.NETWORK
  | ConfigTemplateType.VENUE
  | ConfigTemplateType.DPSK
  | ConfigTemplateType.RADIUS
  | ConfigTemplateType.WIFI_CALLING
