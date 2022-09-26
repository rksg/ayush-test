import { useIntl } from 'react-intl'

import { AnchorLayout } from '@acx-ui/components'

import { CellularOptionsForm } from './CellularOptions/CellularOptionsForm'



export function NetworkingTab () {
  const { $t } = useIntl()

  const items = [{
  //   title: $t({ defaultMessage: 'LAN Ports' }),
  //   content: 'LAN Ports Content'
  // }, {
    title: $t({ defaultMessage: 'Cellular Options' }),
    content: (<CellularOptionsForm></CellularOptionsForm>)
  // }, {
  //   title: $t({ defaultMessage: 'Mesh Network' }),
  //   content: 'Mesh Network Content'
  // }, {
  //   title: $t({ defaultMessage: 'Client Isolation Allowlist' }),
  //   content: 'Client Isolation Allowlist Content'
  }]

  return (
    <div>
      <AnchorLayout items={items} offsetTop={50} />
    </div>

  )
}
