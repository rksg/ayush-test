import { Col, Row } from 'antd'

export interface DriftComparisonData {
  name: string
  values: Array<string | number | boolean | null | undefined> // the array structure is [templateValue, instanceValue]
}


export function DriftComparison (props: DriftComparisonData) {
  const { name, values } = props
  const [templateValue, instanceValue] = values
  // eslint-disable-next-line max-len
  const { templateValueBgColor, instanceValueBgColor } = getItemBgColor(templateValue, instanceValue)

  return <div>
    <div style={{ fontWeight: '600' }}>{name}</div>
    <Row style={{ marginBottom: '12px' }}>
      <Col span={12} style={{ backgroundColor: templateValueBgColor }}>
        {displayConversion(templateValue)}
      </Col>
      <Col span={12} style={{ backgroundColor: instanceValueBgColor }}>
        {displayConversion(instanceValue)}
      </Col>
    </Row>
  </div>
}

function getItemBgColor (
  value1: DriftComparisonData['values'][number], value2: DriftComparisonData['values'][number]
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

function isEmpty (value: DriftComparisonData['values'][number]): boolean {
  return value === null || value === undefined || value === ''
}

function displayConversion (value: DriftComparisonData['values'][number]): string {
  if (isEmpty(value)) return ''

  return value!.toString()
}
