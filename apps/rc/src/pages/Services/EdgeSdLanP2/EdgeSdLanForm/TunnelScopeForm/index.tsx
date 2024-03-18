import { Col, Form, Row, Typography } from 'antd'
import _                              from 'lodash'
import { useIntl }                    from 'react-intl'

import { StepsForm, useStepFormContext }                                    from '@acx-ui/components'
import { ActivatedNetworksTableP2Props, EdgeSdLanP2ActivatedNetworksTable } from '@acx-ui/rc/components'
import { useGetTunnelProfileViewDataListQuery }                             from '@acx-ui/rc/services'
import {
  getTunnelProfileOptsWithDefault,
  getVlanVxlanDefaultTunnelProfileOpt,
  isVlanVxlanDefaultTunnelProfile,
  MtuTypeEnum,
  Network,
  NetworkSaveData,
  NetworkTypeEnum,
  TunnelTypeEnum
} from '@acx-ui/rc/utils'

import { EdgeSdLanFormModelP2 } from '..'
import { messageMappings }      from '../messageMappings'

import { DmzTunnelProfileFormItem } from './DmzTunnelProfileFormItem'
import { TunnelProfileFormItem }    from './TunnelProfileFormItem'

export type EdgeSdLanActivatedNetwork = Pick<NetworkSaveData, 'id' | 'name'>
type NetworksTableProps = Omit<ActivatedNetworksTableP2Props, 'activated' | 'activatedGuest'> & {
  isGuestTunnelEnabled: boolean,
  data?: EdgeSdLanActivatedNetwork[],
  guestData?: EdgeSdLanActivatedNetwork[]
}

const NetworksTable = (props: NetworksTableProps) => {
  const { data, guestData, ...others } = props

  return <EdgeSdLanP2ActivatedNetworksTable
    {...others}
    activated={data?.map(i => i.id!) ?? []}
    activatedGuest={guestData?.map(i => i.id!) ?? []}
  />
}

const tunnelProfileDefaultPayload = {
  fields: ['name', 'id', 'type', 'mtuType'],
  filters: { type: [TunnelTypeEnum.VLAN_VXLAN] },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const toggleItemFromSelected = (
  checked: boolean,
  data: Network,
  selectedNetworks: EdgeSdLanActivatedNetwork[] | undefined
) => {
  let newSelected
  if (checked) {
    newSelected = _.unionBy(selectedNetworks,
      [_.pick(data, ['id', 'name'])], 'id')
  } else {
    newSelected = [...selectedNetworks!]
    _.remove(newSelected, item => item.id === data.id)
  }
  return newSelected
}

export const TunnelScopeForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeSdLanFormModelP2>()
  const venueId = form.getFieldValue('venueId')
  const isGuestTunnelEnabled = form.getFieldValue('isGuestTunnelEnabled')

  const {
    tunnelProfileData,
    isTunnelOptionsLoading
  } = useGetTunnelProfileViewDataListQuery({
    payload: tunnelProfileDefaultPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        tunnelProfileData: data?.data.filter(tt => !isVlanVxlanDefaultTunnelProfile(tt.id)),
        isTunnelOptionsLoading: isLoading
      }
    }
  })

  // eslint-disable-next-line max-len
  const tunnelProfileOptions = getTunnelProfileOptsWithDefault(tunnelProfileData, TunnelTypeEnum.VLAN_VXLAN)
  const dcTunnelProfileOptions = (tunnelProfileData
    ?.map(item => ({ label: item.name!, value: item.id! }))) ?? []
  const isSdLanDefaultExist = dcTunnelProfileOptions
    .filter(item => isVlanVxlanDefaultTunnelProfile(item.value)).length > 0
  if (!isSdLanDefaultExist) {
    const vlanVxLanDefault = getVlanVxlanDefaultTunnelProfileOpt()
    dcTunnelProfileOptions.push(vlanVxLanDefault)
  }

  const dmzTunnelProfileOptions = (tunnelProfileData
    ?.filter(item => item.mtuType === MtuTypeEnum.MANUAL)
    ?.map(item => ({ label: item.name!, value: item.id! }))) ?? []

  const handleActivateChange = (
    fieldName: string,
    data: Network,
    checked: boolean
  ) => {
    // const newSelected = activated.map(item => _.pick(item, ['id', 'name']))
    const changedData = _.pick(data, ['id', 'name'])
    // eslint-disable-next-line max-len
    const activatedNetworks = (form.getFieldValue('activatedNetworks') as EdgeSdLanActivatedNetwork[]) ?? []
    // eslint-disable-next-line max-len
    const activatedGuestNetworks = (form.getFieldValue('activatedGuestNetworks') as EdgeSdLanActivatedNetwork[]) ?? []

    // eslint-disable-next-line max-len
    const affectedNetworks = fieldName === 'activatedNetworks' ? activatedNetworks : activatedGuestNetworks
    let newSelected = _.cloneDeep(affectedNetworks)
    if (checked) newSelected = affectedNetworks.concat([changedData])
    else _.remove(newSelected, i => i.id === changedData.id)

    if (isGuestTunnelEnabled
      && (fieldName === 'activatedNetworks' || (fieldName === 'activatedGuestNetworks' && checked))
      && data.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL ) {

      if (fieldName === 'activatedNetworks') {
        const updateContent = {
          [fieldName]: newSelected
        } as Record<string, EdgeSdLanActivatedNetwork[]>

        // vlan pooling enabled cannot be a guest network
        const isVlanPooling = !_.isNil(data.vlanPool)
        if (!isVlanPooling || (isVlanPooling && !checked)) {
          // eslint-disable-next-line max-len
          updateContent['activatedGuestNetworks'] = toggleItemFromSelected(checked, data, activatedGuestNetworks)
        }

        form.setFieldsValue(updateContent)
      } else {
        const newSelectedNetworks = toggleItemFromSelected(checked, data, activatedNetworks)
        form.setFieldsValue({
          [fieldName]: newSelected,
          activatedNetworks: newSelectedNetworks
        })
      }
    } else {
      form.setFieldValue(fieldName, newSelected)
    }
  }

  const onTunnelChange = (val: string) => {
    form.setFieldValue('tunnelProfileName',
      tunnelProfileOptions?.filter(i => i.value === val)[0]?.label)
  }

  const onDmzTunnelChange = (val: string) => {
    form.setFieldValue('guestTunnelProfileName',
      tunnelProfileOptions?.filter(i => i.value === val)[0]?.label)
  }

  return (
    <>
      <Row>
        <Col span={24}>
          <StepsForm.Title>{$t({ defaultMessage: 'Tunnel & Network Settings' })}</StepsForm.Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <TunnelProfileFormItem
            options={dcTunnelProfileOptions}
            isLoading={isTunnelOptionsLoading}
            onChange={onTunnelChange}
          />
        </Col>
      </Row>
      {isGuestTunnelEnabled &&
        <Row>
          <Col span={24}>
            <DmzTunnelProfileFormItem
              options={dmzTunnelProfileOptions}
              isLoading={isTunnelOptionsLoading}
              onChange={onDmzTunnelChange}
            />
          </Col>
        </Row>
      }
      <Row >
        <Col span={24}>
          <Typography.Text>
            {$t(messageMappings.scope_network_table_description)}
          </Typography.Text>
        </Col>
      </Row>
      <Row >
        <Col span={24}>
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => {
              return _.get(prev, 'activatedNetworks') !== _.get(cur, 'activatedNetworks')
                  || _.get(prev, 'activatedGuestNetworks') !== _.get(cur, 'activatedGuestNetworks')
            }}
          >
            {({ getFieldValue }) => {
              const activatedNetworks = getFieldValue('activatedNetworks')
              const activatedGuestNetworks = getFieldValue('activatedGuestNetworks')

              return <NetworksTable
                venueId={venueId}
                isGuestTunnelEnabled={isGuestTunnelEnabled}
                data={activatedNetworks}
                guestData={activatedGuestNetworks}
                onActivateChange={handleActivateChange}
              />
            }}
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}