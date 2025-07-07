import { useRef } from 'react'

import { Col, Divider, Row, Typography } from 'antd'
import { useIntl }                       from 'react-intl'

import { Descriptions, StepsForm, useStepFormContext }               from '@acx-ui/components'
import { useGetVenuesTemplateListQuery, useVenuesListQuery }         from '@acx-ui/rc/services'
import { CliConfiguration, Venue, useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'
import { TableResult }                                               from '@acx-ui/utils'

import { CodeMirrorWidget } from '../../CodeMirrorWidget'

import * as UI from './styledComponents'

const venuesListPayload = {
  fields: ['name', 'country', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function CliStepSummary () {
  const { $t } = useIntl()
  const { form } = useStepFormContext()

  const data = (form?.getFieldsValue(true) as CliConfiguration)
  const codeMirrorEl = useRef(null as unknown as {
    setValue: Function,
  })

  // eslint-disable-next-line max-len
  const { data: venuesList } = useConfigTemplateQueryFnSwitcher<TableResult<Venue>>({
    useQueryFn: useVenuesListQuery,
    useTemplateQueryFn: useGetVenuesTemplateListQuery,
    payload: venuesListPayload
  })

  return <>
    <Row gutter={24}>
      <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
    </Row>
    <Row>
      <Col span={6}>
        <Descriptions labelWidthPercent={100} layout='vertical'>
          <Descriptions.Item
            label={$t({ defaultMessage: 'Profile Name' })}
            children={data.name} />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Switch Models' })}
            children={data?.models?.map(m =>
              <div key={m}>{m}</div>
            )}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: '<VenuePlural></VenuePlural> to apply' })}
            children={data?.venues?.map(vId => {
              const venue = venuesList?.data?.find(venue => venue.id === vId)
              return venue?.id ? <div key={venue?.id}>{venue?.name}</div> : '--'
            })}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Override existing configuration' })}
            children={data?.overwrite
              ? $t({ defaultMessage: 'ON' })
              : $t({ defaultMessage: 'OFF' })
            } />
        </Descriptions>
      </Col>
      <Col span={1} style={{ maxWidth: '24px' }}>
        <Divider type='vertical' style={{ height: '100%' }} />
      </Col>
      <Col span={13}>
        <Typography.Text style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
          {$t({ defaultMessage: 'CLI Configurations' })}
        </Typography.Text>
        <UI.CodeMirrorContainer>
          <CodeMirrorWidget
            ref={codeMirrorEl}
            containerId='previewContainerId'
            type='cli'
            size={{
              height: '450px',
              width: '100%'
            }}
            data={{
              clis: data?.cli || '',
              configOptions: {
                readOnly: true
              }
            }}
          />
        </UI.CodeMirrorContainer>
      </Col>
    </Row>
  </>
}
