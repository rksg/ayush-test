import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'

import { PortsContext } from '..'
import * as UI          from '../styledComponents'

interface SubInterfaceTableProps {
  ip: string
  mac: string
}

const SubInterfaceTable = (props: SubInterfaceTableProps) => {

  const { $t } = useIntl()

  return (
    <UI.IpAndMac>
      {
        $t(
          { defaultMessage: 'IP Address: {ip}   |   MAC Address: {mac}' },
          { ip: props.ip, mac: props.mac }
        )
      }
    </UI.IpAndMac>
  )
}

const SubInterface = () => {
  const { $t } = useIntl()
  const { ports } = useContext(PortsContext)
  const [tabDetails, setTabDetails] = useState<ContentSwitcherProps['tabDetails']>([])

  useEffect(() => {
    if(ports) {
      setTabDetails(ports.map((data, index) => {
        return {
          label: $t({ defaultMessage: 'Port {index}' }, { index: index + 1 }),
          value: 'port_' + (index + 1),
          children: <SubInterfaceTable ip={data.ip} mac={data.mac} />
        }
      }))
    }
  }, [ports, $t])

  return (
    <ContentSwitcher
      tabDetails={tabDetails}
      defaultValue={'port_1'}
      size='large'
      align='left'
    />
  )
}

export default SubInterface