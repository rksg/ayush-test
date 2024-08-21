import React from 'react'

import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { AIDrivenRRM, AIOperation, AirFlexAI, EcoFlexAI } from '@acx-ui/icons'

import { aiFeatures, aiFeaturesLabel, codes } from '../config'
import { useIntentContext }                   from '../IntentContext'

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
  /** @default 'large' */
  size?: keyof typeof sizes
}

export const Icon = ({ feature, size = 'large' }: SizeProps & { feature: aiFeatures }) => {
  return React.cloneElement(icons[feature], { style: sizes[size] })
}

export const IntentIcon = (props: SizeProps) => {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const feature = codes[intent.code].aiFeature
  return <Space size={10} align='center'>
    {<Icon feature={feature} {...props} />}
    <Typography.Title level={3} children={$t(aiFeaturesLabel[feature])} />
  </Space>
}
