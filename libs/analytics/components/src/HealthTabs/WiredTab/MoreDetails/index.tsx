import { Typography } from 'antd'

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

  const onClose = () => {
    setVisible(false)
    setWidget('')
  }
  const mapping = [
    {
      type: 'dhcp',
      title: 'DHCP Failure',
      pieTitle: 'Top DHCP failure switches',
      tableTitle: 'Top Impacted Clients',
      pieData: []
    },
    {
      type: 'congestion',
      title: 'Congestion',
      pieTitle: 'Top Congested switches',
      tableTitle: 'Top Impacted Clients',
      pieData: []
    },
    {
      type: 'portStorm',
      title: 'Ports experiencing Storm',
      pieTitle: 'Top Storm switches',
      tableTitle: 'Top Impacted Clients',
      pieData: []
    },
    {
      type: 'cpu',
      title: 'High CPU',
      pieTitle: 'Top Switches with High CPU',
      tableTitle: 'Top Impacted Clients',
      pieData: []
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