import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Drawer } from '@acx-ui/components'

import * as UI from './styledComponents'

interface AddMoreDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  widget: String
  setWidget: (widget: String) => void
}

export const AddMoreDetailsDrawer = (props: AddMoreDetailsDrawerProps) => {

  const { visible, setVisible, widget, setWidget } = props
  const { $t } = useIntl()
  const onClose = () => {
    setVisible(false)
    setWidget('')
  }
  const mapping = [
    {
      type: 'dhcp',
      title: $t({ defaultMessage: 'DHCP Failure' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Switches' })
    },
    {
      type: 'congestion',
      title: $t({ defaultMessage: 'Congestion' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Clients' })
    },
    {
      type: 'portStorm',
      title: $t({ defaultMessage: 'Port Storm' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Clients' })
    },
    {
      type: 'cpu',
      title: $t({ defaultMessage: 'High CPU' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Switches' })
    }
  ]
  const matchingMapping = mapping.find(item => item.type === widget)
  return (
    <Drawer
      title={
        <UI.Title>
          <Typography.Title level={2}>
            {matchingMapping?.title}
          </Typography.Title>
        </UI.Title>
      }
      width={1082}
      visible={visible}
      onClose={onClose}
      style={{ marginTop: '85px' }}
      children={null} // piechart, table TBD
    />
  )
}