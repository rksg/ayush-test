import { useState } from 'react'

import { Col, Row, Tooltip } from 'antd'
import { useIntl }           from 'react-intl'

import { Loader }                                                  from '@acx-ui/components'
import { ConfigTemplateDriftRecord, ConfigTemplateDriftValueType } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function DriftComparison (props: ConfigTemplateDriftRecord) {
  const { path, data } = props
  const { template, instance } = data
  const { templateValueBgColor, instanceValueBgColor } = getItemBgColor(template, instance)

  return <div>
    <UI.BoldLabel>{path}</UI.BoldLabel>
    <Row style={{ marginBottom: '12px' }} gutter={8}>
      {/* eslint-disable-next-line max-len */}
      <Col span={12} style={{ backgroundColor: templateValueBgColor, wordBreak: 'break-all', borderRight: '2px solid #FFF' }}>
        <DriftViewer value={template} />
      </Col>
      <Col span={12} style={{ backgroundColor: instanceValueBgColor, wordBreak: 'break-all' }}>
        <DriftViewer value={instance} />
      </Col>
    </Row>
  </div>
}

export function DriftViewer (props: { value: ConfigTemplateDriftValueType }) {
  const { value } = props

  if (isImageUrl(value)) {
    return <ImageViewer imageUrl={value as string} />
  }
  return <>{convertDriftDisplayValue(value)}</>
}

function convertDriftDisplayValue (value: ConfigTemplateDriftValueType): string {
  if (isEmpty(value)) return ''

  return value!.toString()
}

function ImageViewer (props: { imageUrl: string }) {
  const { imageUrl } = props
  const { $t } = useIntl()
  const [ loading, setLoading ] = useState(true)

  return <Tooltip
    placement='left'
    overlayStyle={{ maxWidth: '430px' }}
    title={<>
      <img src={imageUrl}
        alt='Drift Value Preview'
        style={{ maxWidth: 400, maxHeight: 400, display: loading ? 'none' : undefined }}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading &&
        <Loader
          states={[{ isLoading: true }]}
          style={{ width: '200px', height: '200px' }}>
        </Loader>
      }
    </>}
  >
    <a href={imageUrl} target='_blank' rel='noopener noreferrer'>
      {$t({ defaultMessage: 'Open Image in New Tab' })}
    </a>
  </Tooltip>
}

const isImageUrl = (url: ConfigTemplateDriftValueType): boolean => {
  if (typeof url !== 'string') return false

  const urlWithoutParams = url.split('?')[0].split('#')[0]
  return /^(https?:\/\/).*\.(jpeg|jpg|gif|png|svg|webp)$/i.test(urlWithoutParams)
}


function getItemBgColor (
  templateValue: ConfigTemplateDriftValueType, instanceValue: ConfigTemplateDriftValueType
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

function isEmpty (value: ConfigTemplateDriftValueType): boolean {
  return value === null || value === undefined || value === ''
}
