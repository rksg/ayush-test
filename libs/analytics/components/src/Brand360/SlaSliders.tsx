import { useEffect, useState } from 'react'

import { Slider }  from 'antd'
import { useIntl } from 'react-intl'

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
import type { Settings }                   from '@acx-ui/analytics/utils'
import { Button, Card }                    from '@acx-ui/components'
import { formatter, FormatterType }        from '@acx-ui/formatter'

import { SliderLabel, Buttons } from './styledComponents'

export const SlaSliders = ({ settings }: { settings: Partial<Settings> }) => {
  const { $t } = useIntl()
  const [updateSlas] = useUpdateTenantSettingsMutation()
  const [slas, setSlas] = useState(settings)
  useEffect(() => setSlas(settings), [settings])
  const SlaSlider = ({ name, format }: { name: keyof Settings, format: FormatterType }) => <Slider
    min={0}
    max={100}
    marks={{ 0: formatter(format)(0), 100: formatter(format)(100) }}
    tipFormatter={formatter(format)}
    defaultValue={parseInt(slas[name]!, 10)}
    onAfterChange={(value: number) => setSlas({ ...slas, [name]: value.toString() })}
  />
  return <Card title={$t({ defaultMessage: 'Service Level Agreements' })}>
    <SliderLabel>{$t({ defaultMessage: 'P1 Incidents' })}</SliderLabel>
    <SlaSlider name='sla-p1-incidents-count' format='countFormat' />
    <SliderLabel>{$t({ defaultMessage: 'Guest Experience' })}</SliderLabel>
    <SlaSlider name='sla-guest-experience' format='percent' />
    <SliderLabel>{$t({ defaultMessage: 'SSID Compliance' })}</SliderLabel>
    <SlaSlider name='sla-brand-ssid-compliance' format='percent' />
    <Buttons>
      <Button onClick={() => updateSlas(slas)} size={'small'} type='primary'>
        {$t({ defaultMessage: 'Apply' })}
      </Button>
      <Button onClick={() => setSlas(settings)} size={'small'}>
        {$t({ defaultMessage: 'Reset' })}
      </Button>
    </Buttons>
  </Card>
}
