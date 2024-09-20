import { Col, Row } from 'antd'

import { TemplateInstanceDriftValue } from '@acx-ui/rc/utils'

export interface DriftComparisonData {
  name: string
  values: {
    template: TemplateInstanceDriftValue
    instance: TemplateInstanceDriftValue
  }
}

export function DriftComparison (props: DriftComparisonData) {
  const { name, values } = props
  const { template, instance } = values
  // eslint-disable-next-line max-len
  const { templateValueBgColor, instanceValueBgColor } = getItemBgColor(template, instance)

  return <div>
    <div style={{ fontWeight: '600' }}>{name}</div>
    <Row style={{ marginBottom: '12px' }}>
      <Col span={12} style={{ backgroundColor: templateValueBgColor }}>
        {displayConversion(template)}
      </Col>
      <Col span={12} style={{ backgroundColor: instanceValueBgColor }}>
        {displayConversion(instance)}
      </Col>
    </Row>
  </div>
}

function getItemBgColor (
  value1: TemplateInstanceDriftValue, value2: TemplateInstanceDriftValue
): { templateValueBgColor: string, instanceValueBgColor: string } {

  if (value1 && isEmpty(value2)) {
    return {
      templateValueBgColor: '#B4E8C7',
      instanceValueBgColor: '#F2F2F2'
    }
  } else if (isEmpty(value1) && value2) {
    return {
      templateValueBgColor: '#F2F2F2',
      instanceValueBgColor: '#B4E8C7'
    }
  }

  return {
    templateValueBgColor: '#FBD9AB',
    instanceValueBgColor: '#FBD9AB'
  }
}

function isEmpty (value: TemplateInstanceDriftValue): boolean {
  return value === null || value === undefined || value === ''
}

function displayConversion (value: TemplateInstanceDriftValue): string {
  if (isEmpty(value)) return ''

  return value!.toString()
}
