import { useEffect, useState } from 'react'

import { Slider }  from 'antd'
import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
import type { Settings }                   from '@acx-ui/analytics/utils'
import { Button, Card, Loader }            from '@acx-ui/components'
import { formatter, FormatterType }        from '@acx-ui/formatter'

import { SliderLabel, Buttons } from './styledComponents'

export const SlaSliders = ({ settings }: { settings: Partial<Settings> }) => {
  const { $t } = useIntl()
  const [updateSlas, result] = useUpdateTenantSettingsMutation()
  const [slas, setSlas] = useState(settings)
  const [savedSlas, setSavedSlas] = useState(settings)
  useEffect(() => {
    setSlas(settings)
    setSavedSlas(settings)
  }, [settings])
  const SlaSlider = ({ name, format }: { name: keyof Settings, format: FormatterType }) => <Slider
    min={0}
    max={100}
    marks={{ 0: formatter(format)(0), 100: formatter(format)(100) }}
    tipFormatter={formatter(format)}
    defaultValue={parseInt(slas[name]!, 10)}
    onAfterChange={(value: number) => setSlas({ ...slas, [name]: value.toString() })}
  />
  const disabled = isEqual(slas, savedSlas)
  return <Loader states={[result]}>
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
          onClick={() => {setSavedSlas(slas);updateSlas(slas)}}
        >
          {$t({ defaultMessage: 'Apply' })}
        </Button>
        <Button
          size='small'
          disabled={disabled}
          onClick={() => setSlas(savedSlas)}
        >
          {$t({ defaultMessage: 'Reset' })}
        </Button>
      </Buttons>
    </Card>
  </Loader>
}
