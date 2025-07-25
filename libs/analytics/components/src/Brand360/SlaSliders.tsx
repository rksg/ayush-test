import { useState } from 'react'

import { Slider }  from 'antd'
import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'

import { useUpdateTenantSettingsMutation }         from '@acx-ui/analytics/services'
import type { Settings }                           from '@acx-ui/analytics/utils'
import { Button, Card, Loader }                    from '@acx-ui/components'
import { formatter, FormatterType }                from '@acx-ui/formatter'
import { WifiScopes }                              from '@acx-ui/types'
import { hasCrossVenuesPermission, hasPermission } from '@acx-ui/user'

import { SliderLabel, Buttons, SliderWrapper } from './styledComponents'

export const SlaSliders = ({ initialSlas, currentSlas, setCurrentSlas }: {
  initialSlas: Partial<Settings>,
  currentSlas: Partial<Settings>,
  setCurrentSlas: CallableFunction
}) => {
  const { $t } = useIntl()
  const [updateSlas, result] = useUpdateTenantSettingsMutation()
  const [savedSlas, setSavedSlas] = useState<Partial<Settings>>(initialSlas)
  const SlaSlider = ({ name, format }: { name: keyof Settings, format: FormatterType }) => <Slider
    min={0}
    max={100}
    marks={{ 0: formatter(format)(0), 100: formatter(format)(100) }}
    tipFormatter={formatter(format)}
    defaultValue={parseInt(currentSlas[name]!, 10)}
    onAfterChange={(value: number) => setCurrentSlas({ ...currentSlas, [name]: value.toString() })}
  />
  const isReadOnly = !(hasCrossVenuesPermission() && hasPermission({ scopes: [WifiScopes.UPDATE] }))
  const disabled = isEqual(savedSlas, currentSlas) || isReadOnly
  return <SliderWrapper>
    <Loader states={[result]}>
      <Card title={$t({ defaultMessage: 'Service Level Agreements' })}>
        <SliderLabel>{$t({ defaultMessage: 'P1 Incidents' })}</SliderLabel>
        <SlaSlider name='sla-p1-incidents-count' format='countFormat' />
        <SliderLabel>{$t({ defaultMessage: 'Guest Experience' })}</SliderLabel>
        <SlaSlider name='sla-guest-experience' format='percent' />
        <SliderLabel>{$t({ defaultMessage: 'SSID Compliance' })}</SliderLabel>
        <SlaSlider name='sla-brand-ssid-compliance' format='percent' />

        <Buttons>
          <Button
            size='small'
            type='primary'
            disabled={disabled}
            onClick={() => { setSavedSlas(currentSlas); updateSlas(currentSlas) }}
          >
            {$t({ defaultMessage: 'Apply' })}
          </Button>
          <Button
            size='small'
            disabled={disabled}
            onClick={() => setCurrentSlas(savedSlas)}
          >
            {$t({ defaultMessage: 'Reset' })}
          </Button>
        </Buttons>
      </Card>
    </Loader>
  </SliderWrapper>
}
