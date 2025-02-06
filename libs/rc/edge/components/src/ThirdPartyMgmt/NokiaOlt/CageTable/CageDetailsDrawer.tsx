import { useState } from 'react'

import { Row, Col, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Drawer }          from '@acx-ui/components'
import {
  EdgeNokiaCageData,
  EdgeNokiaOltData,
  EdgeNokiaOnuData,
  getOltPoeClassText,
  transformDisplayNumber
} from '@acx-ui/rc/utils'

import { EdgeNokiaOnuPortTable } from '../OnuPortTable'
import { EdgeNokiaOnuTable }     from '../OnuTable'

import { OnuDetailWrapper, StyledFormItem } from './styledComponents'

interface CageDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  oltData: EdgeNokiaOltData
  currentCage: EdgeNokiaCageData | undefined,
}

export const CageDetailsDrawer = (props: CageDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, oltData, currentCage } = props

  const [currentOnu, setCurrentOnu] = useState<EdgeNokiaOnuData | undefined>(undefined)

  const onClose = () => {
    setVisible(false)
  }

  const handleOnOnuClick = (onu: EdgeNokiaOnuData | undefined) => {
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
            oltData={oltData}
            cageName={currentCage?.name}
          />
        </Col>
      </Row>

      {currentOnu && <OnuDetailWrapper>
        <Typography.Title level={3}>{currentOnu.name}</Typography.Title>
        <Col span={24}>
          <StyledFormItem
            label={$t({ defaultMessage: 'PoE Class' })}
            children={<div style={{ width: '100%', marginTop: -20 }}>
              {getOltPoeClassText(currentOnu.poeClass)}
            </div>}
          />
          <StyledFormItem
            label={$t({ defaultMessage: 'Ports ({count})' },
              { count: transformDisplayNumber(currentOnu.ports) })}
            children={<div style={{ width: '100%' }}>
              <EdgeNokiaOnuPortTable
                data={currentOnu.portDetails}
                oltData={oltData}
                cageName={currentCage?.name}
                onuName={currentOnu.name}
              />
            </div>}
          />
        </Col>
      </OnuDetailWrapper>}
    </Drawer>
  )
}