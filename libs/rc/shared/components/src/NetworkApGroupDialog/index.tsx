/* eslint-disable max-len */
import { useEffect, useState, useRef, useMemo, createContext } from 'react'

import {
  ModalProps as AntdModalProps,
  Col,
  Form,
  Radio,
  Row,
  Space,
  Spin
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import _            from 'lodash'
import { useIntl }  from 'react-intl'

import {
  Modal
} from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useGetEnhancedVlanPoolPolicyTemplateListQuery,
  useGetNetworkApGroupsV2Query,
  useGetRbacNetworkApGroupsQuery,
  useGetRbacNetworkApGroupsV2Query,
  useGetVLANPoolPolicyViewModelListQuery
} from '@acx-ui/rc/services'
import {
  RadioEnum,
  RadioTypeEnum,
  NetworkApGroup,
  VlanPool,
  VlanType,
  getVlanString,
  NetworkVenue,
  NetworkSaveData,
  IsNetworkSupport6g,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher,
  TableResult,
  VLANPoolViewModelType,
  validateRadioBandForDsaeNetwork
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { ApCompatibilityDrawer, ApCompatibilityToolTip, ApCompatibilityType, InCompatibilityFeatures } from '../ApCompatibility'

import { ApGroupItem } from './ApGroupItem'
import { RadioSelect } from './RadioSelect'
import * as UI         from './styledComponents'

const isDisableAllAPs = (apGroups?: NetworkApGroup[]) => {
  if (!apGroups) {
    return false
  }
  return !apGroups.every(apGroup => !apGroup.validationError)
}

export interface VlanDate {
  vlanId?: number,
  vlanPool?: VlanPool | null,
  vlanType: VlanType
}

interface NetworkApGroupWithSelected extends NetworkApGroup {
  selected: boolean
}

const defaultAG: NetworkApGroupWithSelected = {
  selected: true,
  apGroupId: '',
  apGroupName: '',
  isDefault: true,
  radio: RadioEnum.Both,
  radioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
  vlanId: 1
}

export interface ApGroupModalWidgetProps extends AntdModalProps {
  formName?: string
  networkVenue?: NetworkVenue
  venueName?: string
  network?: NetworkSaveData | null
  tenantId?: string
}

export type NetworkApGroupDialogContextProps = {
  network: NetworkSaveData | undefined | null,
  vlanPoolSelectOptions: VlanPool[] | undefined,
  isSupport6G: boolean
}

export const NetworkApGroupDialogContext = createContext({} as NetworkApGroupDialogContextProps)

export function NetworkApGroupDialog (props: ApGroupModalWidgetProps) {
  const intl = useIntl()

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isUseNewRbacNetworkVenueApi = useIsSplitOn(Features.WIFI_NETWORK_VENUE_QUERY)
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)
  const isSupportR370ToggleOn = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const isR370Unsupported6gFeatures = isSupportR370ToggleOn && isSupport6gOWETransition
  const { isTemplate } = useConfigTemplate()

  const [owe6gDrawerVisible, setOwe6gDrawerVisible] = useState(false)

  const { networkVenue, venueName, network, formName, tenantId } = props
  const { wlan } = network || {}
  const isSupport6G = IsNetworkSupport6g(network, { isSupport6gOWETransition })

  const [vlanPoolSelectOptions, setVlanPoolSelectOptions] = useState<VlanPool[]>()

  const [form] = Form.useForm()

  const selectionType = useWatch('selectionType', form)

  const open = !!props.visible

  // reset form fields when modal is closed
  const prevOpenRef = useRef(false)
  const prevOpen = prevOpenRef.current

  useEffect(() => {
    prevOpenRef.current = open
    if (!open && prevOpen) {
      setLoading(false)
      form.resetFields()
    }
  }, [form, prevOpen, open])

  const networkVlanPool = wlan?.advancedCustomization?.vlanPool
  const defaultVlanString = getVlanString(networkVlanPool, wlan?.vlanId ?? 1)

  function useNetworkApGroupsInstance () {
    const params = { tenantId }
    const payload = [{
      networkId: networkVenue?.networkId,
      venueId: networkVenue?.venueId,
      isTemplate: isTemplate
    }]

    const hasNetworkVenueAndWlan = networkVenue && wlan
    const networkApGroupsV2Query = useGetNetworkApGroupsV2Query({ params, payload
    }, { skip: isWifiRbacEnabled || !hasNetworkVenueAndWlan })

    const networkApGroupsRbacQuery = useGetRbacNetworkApGroupsQuery({ params, payload
    }, { skip: isUseNewRbacNetworkVenueApi || !isWifiRbacEnabled || !hasNetworkVenueAndWlan })

    const networkApGroupsRbacV2Query = useGetRbacNetworkApGroupsV2Query({ params, payload
    }, { skip: !isUseNewRbacNetworkVenueApi || !isWifiRbacEnabled || !hasNetworkVenueAndWlan })

    return isWifiRbacEnabled
      ? (isUseNewRbacNetworkVenueApi? networkApGroupsRbacV2Query : networkApGroupsRbacQuery)
      : networkApGroupsV2Query
  }

  const { data: networkApGroupsData, isFetching: isNetworkFetching } = useNetworkApGroupsInstance()

  const formInitData = useMemo(() => {
    // if specific AP groups were selected or the  All APs option is disabled,
    // then the "select specific AP group" option should be selected
    const isAllAps = networkVenue?.isAllApGroups !== false && !isDisableAllAPs(networkVenue?.apGroups)

    let allApGroups: NetworkApGroupWithSelected[] = (networkApGroupsData || [])
      .map(nv => nv.apGroups || []).flat()
      .map(allAg => {
        const apGroup = _.find(networkVenue?.apGroups, ['apGroupId', allAg.apGroupId])

        if (apGroup) {
          const {
            validationError,
            validationErrorReachedMaxConnectedCaptiveNetworksLimit,
            validationErrorReachedMaxConnectedNetworksLimit,
            validationErrorSsidAlreadyActivated
          } = allAg

          return {
            ...apGroup,
            selected: true,
            validationError: validationError,
            validationErrorReachedMaxConnectedCaptiveNetworksLimit,
            validationErrorReachedMaxConnectedNetworksLimit,
            validationErrorSsidAlreadyActivated
          }
        }
        return { ...allAg, selected: false }
      })
    allApGroups = _.isEmpty(allApGroups) ? [defaultAG] : allApGroups

    return {
      selectionType: isAllAps ? 0 : 1,
      allApGroupsRadioTypes: networkVenue?.allApGroupsRadioTypes || [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz],
      apgroups: allApGroups,
      apTags: []
    }
  }, [networkVenue, networkApGroupsData])

  const [loading, setLoading] = useState(false)

  const { data: instanceListResult, isFetching: isVlanPoolFetching } = useConfigTemplateQueryFnSwitcher<TableResult<VLANPoolViewModelType>>({
    useQueryFn: useGetVLANPoolPolicyViewModelListQuery,
    useTemplateQueryFn: useGetEnhancedVlanPoolPolicyTemplateListQuery,
    skip: false,
    payload: {
      fields: ['name', 'id', 'vlanMembers'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    },
    enableRbac: isPolicyRbacEnabled
  })

  useEffect(() => {
    form.setFieldsValue(formInitData)
    if (instanceListResult) {
      setVlanPoolSelectOptions(instanceListResult.data.map(m => {
        return { name: m.name, id: m.id } as VlanPool
      }) as VlanPool[])
    }
  },[formInitData, instanceListResult])

  const onOk = () => {
    form.validateFields()
      .then(() => {
        setLoading(true)
        form.submit()
      })
      .catch(() => {
        return
      })
  }

  return (
    <Modal
      {...props}
      title={intl.$t({ defaultMessage: 'Select APs' })}
      subTitle={intl.$t({ defaultMessage: 'Define how this network will be activated on <venueSingular></venueSingular> "{venueName}"' }, { venueName: venueName })}
      okText={intl.$t({ defaultMessage: 'Apply' })}
      maskClosable={true}
      keyboard={false}
      closable={true}
      width={840}
      onOk={onOk}
      okButtonProps={{ disabled: loading || isNetworkFetching || isVlanPoolFetching }}
      cancelButtonProps={{ disabled: loading || isNetworkFetching || isVlanPoolFetching }}
    >
      <Spin spinning={loading || isNetworkFetching || isVlanPoolFetching}><Form
        form={form}
        layout='horizontal'
        size='small'
        name={formName}
        onFinish={props.onOk}
      >
        <NetworkApGroupDialogContext.Provider value={{ network, vlanPoolSelectOptions, isSupport6G }}>
          <Form.Item name='selectionType'
            rules={[
              {
                validator: (obj, value) => {
                  const { $t } = getIntl()
                  if (value === 1 &&
                             form.getFieldsValue().apgroups.filter((i: { selected: boolean }) => i.selected).length === 0) {
                    return Promise.reject($t({ defaultMessage: 'Please select AP Group' }))
                  }
                  return Promise.resolve()
                }
              }
            ]}>
            <Radio.Group>
              <Space direction='vertical' size='middle'>
                <Radio value={0} disabled={isDisableAllAPs(networkVenue?.apGroups)}>{intl.$t({ defaultMessage: 'All APs' })}
                  <UI.RadioDescription>{intl.$t({ defaultMessage: 'Including any AP that will be added to this <venueSingular></venueSingular> in the future.' })}</UI.RadioDescription>
                </Radio>
                <Form.Item noStyle>
                  { selectionType === 0 && <UI.FormItemRounded>
                    <Form.Item label={intl.$t({ defaultMessage: 'VLAN' })} labelCol={{ span: 5 }}>
                      {defaultVlanString.vlanText}
                    </Form.Item>
                    <Form.Item name='allApGroupsRadioTypes'
                      label={<>
                        {intl.$t({ defaultMessage: 'Radio Band' })}
                        {isR370Unsupported6gFeatures && <>
                          <ApCompatibilityToolTip
                            title={''}
                            showDetailButton
                            placement='bottom'
                            onClick={() => setOwe6gDrawerVisible(true)}
                          />
                          <ApCompatibilityDrawer
                            visible={owe6gDrawerVisible}
                            type={ApCompatibilityType.ALONE}
                            networkId={network?.id}
                            featureName={InCompatibilityFeatures.OWE_TRANSITION_6G}
                            onClose={() => setOwe6gDrawerVisible(false)}
                          />
                        </>}
                      </>}
                      rules={[{ required: true },
                        {
                          validator: (_, value) => validateRadioBandForDsaeNetwork(value, network, intl)
                        }]}
                      labelCol={isR370Unsupported6gFeatures ? { span: 6 } : { span: 5 }}>
                      <RadioSelect isSupport6G={isSupport6G}/>
                    </Form.Item>
                  </UI.FormItemRounded>}
                </Form.Item>

                <Radio value={1}>{intl.$t({ defaultMessage: 'Select specific AP groups' })}
                  <UI.RadioDescription>{intl.$t({ defaultMessage: 'Including any AP that will be added to a selected AP group in the future.' })}</UI.RadioDescription>
                </Radio>
                <Form.List name='apgroups'>
                  { (fields) => (
                    <Form.Item noStyle>
                      { selectionType === 1 && <Row gutter={[4, 0]} style={{ width: '750px' }}>
                        <Col span={8}></Col>
                        <Col span={8}>
                          <UI.VerticalLabel>{intl.$t({ defaultMessage: 'VLAN' })}</UI.VerticalLabel>
                        </Col>
                        <Col span={8}>
                          <UI.VerticalLabel>{intl.$t({ defaultMessage: 'Radio Band' })}</UI.VerticalLabel>
                        </Col>
                        { fields.map((field, index) => (
                          <Form.Item key={field.key} noStyle>
                            <ApGroupItem
                              key={field.key}
                              name={field.name}
                              apgroup={form.getFieldValue('apgroups')[index]}
                            />
                          </Form.Item>
                        ))}
                      </Row>}
                    </Form.Item>
                  )}
                </Form.List>

                {/* <Radio value={2}>{$t({ defaultMessage: 'Select APs by tag' })} // TODO: Waiting for TAG feature support
                <UI.RadioDescription>{$t({ defaultMessage: 'This network will be only applied to APs with the tags.' })}</UI.RadioDescription>
              </Radio>
              <Form.Item noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.selectionType !== currentValues.selectionType}>
                { ({ getFieldValue }) => getFieldValue('selectionType') === 2 && (
                  <Form.Item label={$t({ defaultMessage: 'Tags' })} name='apTags'>
                    <Select
                      mode='tags'
                      size='middle'
                      allowClear
                      style={{ width: '400px' }}
                    >
                    </Select>
                  </Form.Item>
                )}
              </Form.Item> */}
              </Space>
            </Radio.Group>
          </Form.Item>
        </NetworkApGroupDialogContext.Provider>
      </Form></Spin>
    </Modal>
  )
}

export default NetworkApGroupDialog
