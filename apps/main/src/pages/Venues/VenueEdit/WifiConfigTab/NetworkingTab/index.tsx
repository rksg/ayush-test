import { useIntl } from 'react-intl'

import { AnchorLayout, StepsForm } from '@acx-ui/components'

import { LanPorts } from './LanPorts'

export interface NetworkingSettingContext {
  cellularData: unknown,
  meshData: { mesh: boolean },
  updateCellular: (() => void),
  updateMesh: ((check: boolean) => void)
}

export function NetworkingTab () {
  const { $t } = useIntl()

  const items = [{
    title: $t({ defaultMessage: 'LAN Ports' }),
    content: <LanPorts />
  }, {
    title: $t({ defaultMessage: 'Cellular Options' }),
    content: 'Cellular Options Content'
  }, {
    title: $t({ defaultMessage: 'Mesh Network' }),
    content: 'Mesh Network Content'
  }, {
    title: $t({ defaultMessage: 'Client Isolation Allowlist' }),
    content: 'Client Isolation Allowlist Content'
  }]

  return (
    <StepsForm
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <AnchorLayout items={items} offsetTop={275} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}