import { Col, Form, Row, Typography } from 'antd'
import _                              from 'lodash'
import { useIntl }                    from 'react-intl'

import { StepsForm, useStepFormContext }                                from '@acx-ui/components'
import { ActivatedNetworksTableProps, EdgeSdLanActivatedNetworksTable } from '@acx-ui/rc/components'
import { EdgeSdLanSetting, NetworkSaveData }                            from '@acx-ui/rc/utils'

export type EdgeSdLanActivatedNetwork = Pick<NetworkSaveData, 'id' | 'name'>
type NetworksTableProps = Omit<ActivatedNetworksTableProps, 'activated'> & {
  data?: EdgeSdLanActivatedNetwork[]
}

const NetworksTable = (props: NetworksTableProps) => {
  const { data, ...others } = props
  return <EdgeSdLanActivatedNetworksTable
    {...others}
    activated={data?.map(i => i.id!) ?? []}
  />
}
export const ScopeForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeSdLanSetting>()
  const venueId = form.getFieldValue('venueId')
  const venueName = form.getFieldValue('venueName')

  const handleActivateChange = (data: NetworkSaveData, checked: boolean) => {
    const activatedNetworks = form.getFieldValue('activatedNetworks') as EdgeSdLanActivatedNetwork[]
    let newSelected
    if (checked) {
      newSelected = _.unionBy(activatedNetworks,
        [_.pick(data, ['id', 'name'])], 'id')
    } else {
      newSelected = [...activatedNetworks!]
      _.remove(newSelected, item => item.id === data.id)
    }
    form.setFieldValue('activatedNetworks', newSelected)
  }

  return (
    <>
      <Row>
        <Col span={24}>
          <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>
        </Col>
      </Row>
      <Row >
        <Col span={24}>
          <Typography.Text>
            {$t({
              defaultMessage:
                // eslint-disable-next-line max-len
                'Activate networks for the SD-LAN service on the venue ({venueName}):'
            }, {
              venueName: <Typography.Text strong>{venueName}</Typography.Text>
            })}
          </Typography.Text>
        </Col>
      </Row>
      <Row >
        <Col span={18}>
          <Form.Item
            name='activatedNetworks'
            valuePropName='data'
            noStyle
            initialValue={[]}
          >
            <NetworksTable
              venueId={venueId}
              onActivateChange={handleActivateChange}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
