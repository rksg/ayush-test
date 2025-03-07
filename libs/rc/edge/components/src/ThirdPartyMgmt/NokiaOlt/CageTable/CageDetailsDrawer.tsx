import { useEffect, useState } from 'react'

import { Row, Col, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Drawer, Loader }         from '@acx-ui/components'
import { useGetEdgeOnuListQuery } from '@acx-ui/rc/services'
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
  const cageName = currentCage?.cage

  const [currentOnu, setCurrentOnu] = useState<EdgeNokiaOnuData | undefined>(undefined)

  const { data: onuList, isLoading, isFetching } = useGetEdgeOnuListQuery({
    params: {
      venueId: oltData?.venueId,
      edgeClusterId: oltData?.edgeClusterId,
      oltId: oltData?.serialNumber
    },
    payload: { cageId: cageName }
  }, { skip: !oltData || !cageName })

  const onClose = () => {
    setVisible(false)
  }

  const onClickRow = (onu: EdgeNokiaOnuData | undefined): void => {
    setCurrentOnu(onu)
  }

  const onClearSelection = (): void => {
    setCurrentOnu(undefined)
  }

  // update currentOnu when data changes
  useEffect(() => {
    if (currentOnu) {
      setCurrentOnu(onuList?.find(item => item.name === currentOnu?.name))
    }
  }, [onuList])

  return (
    <Drawer
      title={currentCage?.cage}
      visible={visible}
      onClose={onClose}
      width={600}
    >
      <Row>
        <Col span={24}>
          <Loader
            states={[{ isLoading, isFetching }]}
            style={{ minHeight: '100px', backgroundColor: 'transparent' }}
          >
            <EdgeNokiaOnuTable
              data={onuList}
              cageName={cageName}
              onClickRow={onClickRow}
              onClearSelection={onClearSelection}
            />
          </Loader>
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
                cageName={currentCage?.cage}
                onuName={currentOnu.name}
              />
            </div>}
          />
        </Col>
      </OnuDetailWrapper>}
    </Drawer>
  )
}