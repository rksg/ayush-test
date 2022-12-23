import { Fragment, ReactNode } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { CloseSymbol } from '@acx-ui/icons'

import * as UI from './styledComponents'

const detailsRowList = (
  fields: Array<{ label: string, value: string }>,
  extra?: ReactNode
) => {
  const span = extra ? 10 : 12
  const pull = extra ? 0 : 5
  const push = extra ? 1 : 0
  return fields.map((field, index) =>
    <Row key={index} gutter={[0, 0]}>
      <Col span={span}>
        <UI.DetailsRowLabel>{field.label}</UI.DetailsRowLabel>
      </Col>
      <Col span={span} pull={pull} push={push}>
        <UI.DetailsRowValue>{field.value}</UI.DetailsRowValue>
      </Col>
    </Row>
  )
}

export const Details = ({ fields, openHandler, extra }: {
  fields: Array<{ label: string, value: string }>,
  openHandler?: () => void,
  extra?: ReactNode
}) => {
  const { $t } = useIntl()
  return <UI.DetailsWrapper extra={extra}>
    <Row gutter={[0, 0]}>
      <Col span={24}>
        {openHandler && <UI.CloseRowWrapper onClick={openHandler}>
          <UI.CloseIconContainer>
            <CloseSymbol />
          </UI.CloseIconContainer>
        </UI.CloseRowWrapper>}
      </Col>
    </Row>
    <Row gutter={[0, 0]}>
      <Col span={24}>
        <UI.Header>
          {$t({ defaultMessage: 'Connection Event Details' })}
        </UI.Header>
      </Col>
    </Row>
    <Row>
      {
        (extra)
          ? <>
            <Col span={8}>{detailsRowList(fields, extra)}</Col>
            <Col span={2}><UI.VerticalLine /></Col>
            <Col span={4}>{extra}</Col>
          </>
          : <Col span={24}>
            {detailsRowList(fields)}
          </Col>
      }
    </Row>
  </UI.DetailsWrapper>
}