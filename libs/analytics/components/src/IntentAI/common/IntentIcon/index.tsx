import React from 'react'

import { Typography } from 'antd'
import _              from 'lodash'
import { useIntl }    from 'react-intl'

import { AIDrivenRRM, AIOperation, AirFlexAI, EcoFlexAI } from '@acx-ui/icons'

import { aiFeatures, aiFeaturesLabel, codes } from '../../config'
import { useIntentContext }                   from '../../IntentContext'

import * as UI from './styledComponents'

export const icons = {
  [aiFeatures.RRM]: <AIDrivenRRM />,
  [aiFeatures.AirFlexAI]: <AirFlexAI />,
  [aiFeatures.AIOps]: <AIOperation />,
  [aiFeatures.EcoFlexAI]: <EcoFlexAI />
}

const sizes = {
  xs: { width: 20, height: 20 },
  small: { width: 32, height: 32 },
  large: { width: 48, height: 48 }
}

type SizeProps = {
  size?: keyof typeof sizes
}

export const Icon = ({
  feature,
  size,
  ...props
}: { feature: aiFeatures } & SizeProps & React.SVGProps<SVGSVGElement>) => {
  return React.cloneElement(icons[feature], {
    ...props,
    style: _.merge({}, size ? sizes[size] : {}, props.style)
  })
}

export const IntentIcon = (props: SizeProps) => {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const feature = codes[intent.code].aiFeature
  return <UI.Wrapper>
    {<Icon feature={feature} {...props} />}
    <Typography.Title level={3} children={$t(aiFeaturesLabel[feature])} />
  </UI.Wrapper>
}
