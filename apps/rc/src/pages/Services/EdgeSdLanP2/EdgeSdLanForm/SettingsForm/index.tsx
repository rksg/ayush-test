import { useEffect } from 'react'

import { Select,Col, Form, Input, Row, Switch } from 'antd'
import { useIntl }                              from 'react-intl'
import { useParams }                            from 'react-router-dom'

import {  StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'
import { InformationSolid }                        from '@acx-ui/icons'
import { SpaceWrapper }                            from '@acx-ui/rc/components'
import {
  useGetEdgeListQuery,
  useGetEdgeSdLanP2ViewDataListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  EdgeStatusEnum,
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'

import { EdgeSdLanFormModelP2 } from '..'
import { messageMappings }      from '../messageMappings'

import * as UI from './styledComponents'

export const SettingsForm = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { form, editMode } = useStepFormContext<EdgeSdLanFormModelP2>()
  const venueId = Form.useWatch('venueId', form)
  const edgeClusterId = Form.useWatch('edgeClusterId', form)
  const guestEdgeClusterId = Form.useWatch('guestEdgeClusterId', form)

  const { sdLanBoundEdges, isSdLanBoundEdgesLoading } = useGetEdgeSdLanP2ViewDataListQuery(
    { payload: {
      fields: ['id', 'edgeClusterId']
    } },
    {
      selectFromResult: ({ data, isLoading }) => ({
        sdLanBoundEdges: (data?.data
          ?.flatMap(item => [item.edgeClusterId, item.guestEdgeClusterId])
          .filter(val => !!val)) ?? [],
        isSdLanBoundEdgesLoading: isLoading
      })
    }
  )

  const {
    venueOptions,
    isLoading: isVenueOptionsLoading
  } = useVenuesListQuery({
    params,
    payload: {
      fields: ['name', 'id', 'edges'],
      ...(editMode && { filters: { id: [venueId] } })
    } }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data
          .filter(i => (i.edges ?? 0) > 0)
          .map(item => ({
            label: item.name,
            value: item.id })),
        isLoading
      }
    } })

  const {
    edgeOptions,
    isLoading: isEdgeOptionsLoading
  } = useGetEdgeListQuery({
    params,
    payload: {
      fields: [
        'name',
        'serialNumber',
        'venueId'
      ],
      filters: {
        venueId: [venueId],
        // eslint-disable-next-line max-len
        ...(editMode && { serialNumber: [edgeClusterId, ...(guestEdgeClusterId ? [guestEdgeClusterId] : [])] }),
        deviceStatus: Object.values(EdgeStatusEnum)
          .filter(v => v !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD)
      } } },
  {
    skip: !venueId || isSdLanBoundEdgesLoading,
    selectFromResult: ({ data, isLoading }) => {
      return {
        edgeOptions: data?.data
          .filter(item => editMode ? true : sdLanBoundEdges.indexOf(item.serialNumber) === -1)
          .map(item => ({
            label: item.name,
            value: item.serialNumber,
            venueId: item.venueId
          })),
        isLoading
      }
    }
  })

  // prepare venue info
  useEffect(() => {
    form.setFieldValue('venueName', venueOptions?.filter(i => i.value === venueId)[0]?.label)
  }, [venueId, venueOptions])

  const onVenueChange = () => {
    form.setFieldValue('edgeClusterId', undefined)
  }

  const onEdgeChange = (val: string) => {
    const edgeData = edgeOptions?.filter(i => i.value === val)[0]
    form.setFieldValue('edgeClusterrName', edgeData?.label)
  }

  const onDmzEdgeChange = (val: string) => {
    const edgeData = edgeOptions?.filter(i => i.value === val)[0]
    form.setFieldValue('guestEdgeClusterName', edgeData?.label)
  }

  return (
    <Row>
      <Col span={12}>
        <SpaceWrapper full direction='vertical' size={30}>
          <Row>
            <Col span={18}>
              <StepsForm.Title>
                {$t({ defaultMessage: 'Settings' })}
              </StepsForm.Title>
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Service Name' })}
                rules={[
                  { required: true },
                  { min: 2, max: 32 },
                  { validator: (_, value) => servicePolicyNameRegExp(value) }
                ]}
                validateFirst
                children={<Input />}
              />
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <UI.VenueSelectorText>
                {$t({ defaultMessage: 'Select the venue where you want to apply the SD-LAN:' })}
              </UI.VenueSelectorText>
              <Row>
                <Col span={18}>
                  <Form.Item
                    name='venueId'
                    label={$t({ defaultMessage: 'Venue' })}
                    rules={[{
                      required: true,
                      message: $t({ defaultMessage: 'Please select a Venue' })
                    }]}
                  >
                    <Select
                      loading={isVenueOptionsLoading}
                      options={venueOptions}
                      placeholder={$t({ defaultMessage: 'Select ...' })}
                      disabled={editMode}
                      onChange={onVenueChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={18}>
                  <Form.Item
                    name='edgeClusterId'
                    label={<>
                      { $t({ defaultMessage: 'Cluster' }) }
                      <Tooltip.Question
                        title={$t(messageMappings.setting_cluster_tooltip)}
                        placement='bottom'
                      />
                    </>}
                    rules={[{
                      required: true,
                      message: $t({ defaultMessage: 'Please select a Cluster' })
                    }]}
                  >
                    <Select
                      loading={isEdgeOptionsLoading || isSdLanBoundEdgesLoading}
                      options={edgeOptions}
                      placeholder={$t({ defaultMessage: 'Select ...' })}
                      disabled={editMode}
                      onChange={onEdgeChange}
                    />

                  </Form.Item>
                  <UI.ClusterSelectorHelper>
                    <InformationSolid />
                    {$t(messageMappings.setting_cluster_helper, {
                      infoLink: <a href=''>
                        {$t({ defaultMessage: 'See more information' })}
                      </a>
                    })}
                  </UI.ClusterSelectorHelper>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row>
            <Col span={15}>
              <UI.FieldText>
                {$t({ defaultMessage: 'Tunnel guest traffic to another cluster (DMZ)' })}
              </UI.FieldText>
            </Col>
            <Col span={3}>
              <Form.Item
                name='isGuestTunnelEnabled'
                valuePropName='checked'
                noStyle
              >
                <Switch aria-label='dmzEnabled' />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={18}>
              <Form.Item
                noStyle
                dependencies={['isGuestTunnelEnabled']}
              >
                {({ getFieldValue }) => {
                  return getFieldValue('isGuestTunnelEnabled')
                    ? (<>
                      <Form.Item
                        name='guestEdgeClusterId'
                        label={<>
                          { $t({ defaultMessage: 'DMZ Cluster' }) }
                          <Tooltip.Question
                            title={$t(messageMappings.setting_dmz_cluster_tooltip)}
                            placement='bottom'
                          />
                        </>}
                        rules={[{
                          required: true,
                          message: $t({ defaultMessage: 'Please select a DMZ Cluster' })
                        }]}
                      >
                        <Select
                          loading={isEdgeOptionsLoading || isSdLanBoundEdgesLoading}
                          options={edgeOptions?.filter(item => item.value !== edgeClusterId)}
                          placeholder={$t({ defaultMessage: 'Select ...' })}
                          disabled={editMode}
                          onChange={onDmzEdgeChange}
                        />
                      </Form.Item>
                      <UI.ClusterSelectorHelper>
                        <InformationSolid />
                        {$t(messageMappings.setting_cluster_helper, {
                          infoLink: <a href=''>
                            {$t({ defaultMessage: 'See more information' })}
                          </a>
                        })}
                      </UI.ClusterSelectorHelper>
                    </>)
                    : null
                }}
              </Form.Item>
            </Col>
          </Row>
        </SpaceWrapper>
      </Col>
      <UI.VerticalSplitLine span={1} />
      <Col span={10}>
        <Form.Item
          noStyle
          dependencies={['isGuestTunnelEnabled']}
        >
          {({ getFieldValue }) => {
            return <UI.StyledDiagram
              isGuestTunnelEnabled={getFieldValue('isGuestTunnelEnabled')}
              vertical={true}
            />
          }}
        </Form.Item>
      </Col>
    </Row>
  )
}
