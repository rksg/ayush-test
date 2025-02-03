import { useState } from 'react'

import { Row, Col, Form, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { Drawer }                                                      from '@acx-ui/components'
import { EdgeNokiaCageData, EdgeNokiaOnuData, transformDisplayNumber } from '@acx-ui/rc/utils'

import { EdgeNokiaOnuPortTable } from '../OnuPortTable'
import { EdgeNokiaOnuTable }     from '../OnuTable'

import { OnuDetailWrapper, StyledPoeClassText } from './styledComponents'

interface CageDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentCage: EdgeNokiaCageData | undefined,
}

export const CageDetailsDrawer = (props: CageDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, currentCage } = props

  const [currentOnu, setCurrentOnu] = useState<EdgeNokiaOnuData | undefined>(undefined)

  const onClose = () => {
    setVisible(false)
  }

  const handleOnOnuClick = (onu: EdgeNokiaOnuData) => {
    setCurrentOnu(onu)
  }

  return (
    <Drawer
      title={currentCage?.name}
      visible={visible}
      onClose={onClose}
      width={550}
    >
      <Row>
        <Col span={24}>
          <EdgeNokiaOnuTable
            onClick={handleOnOnuClick}
          />
        </Col>
      </Row>

      {currentOnu && <OnuDetailWrapper>
        <Typography.Title level={3}>{currentOnu?.name}</Typography.Title>
        <Col span={24}>
          <StyledPoeClassText
            label={$t({ defaultMessage: 'PoE Class' })}
            children={
              <div style={{ width: '100%' }}>2 (802.3af 7w)</div>
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Ports ({count})' },
              { count: transformDisplayNumber(currentOnu?.ports) })}
            children={
              <EdgeNokiaOnuPortTable
                data={currentOnu?.portDetails ?? []}
              />
            }
          />
        </Col>
      </OnuDetailWrapper>}
    </Drawer>
  )
}