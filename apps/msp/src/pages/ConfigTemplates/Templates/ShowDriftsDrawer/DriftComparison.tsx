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
  const { templateValueBgColor, instanceValueBgColor } = getItemBgColor(template, instance)

  return <div>
    <div style={{ fontWeight: '600' }}>{name}</div>
    <Row style={{ marginBottom: '12px' }}>
      <Col span={12} style={{ backgroundColor: templateValueBgColor }}>
        {convertDriftDisplayValue(template)}
      </Col>
      <Col span={12} style={{ backgroundColor: instanceValueBgColor }}>
        {convertDriftDisplayValue(instance)}
      </Col>
    </Row>
  </div>
}

export function convertDriftDisplayValue (value: TemplateInstanceDriftValue): string {
  if (isEmpty(value)) return ''

  return value!.toString()
}

function getItemBgColor (
  templateValue: TemplateInstanceDriftValue, instanceValue: TemplateInstanceDriftValue
): { templateValueBgColor: string, instanceValueBgColor: string } {

  if (templateValue && isEmpty(instanceValue)) {
    return {
      templateValueBgColor: '#B4E8C7',
      instanceValueBgColor: '#F2F2F2'
    }
  } else if (isEmpty(templateValue) && instanceValue) {
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
