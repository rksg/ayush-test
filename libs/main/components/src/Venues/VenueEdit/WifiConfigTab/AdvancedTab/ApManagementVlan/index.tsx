import { useContext, useEffect } from 'react'

import { InputNumber, Form, Space, Row, Col } from 'antd'
import { useIntl }                            from 'react-intl'
import { useParams }                          from 'react-router-dom'

import {
  Loader,
  StepsFormLegacy,
  cssStr,
  showActionModal,
  AnchorContext
}                         from '@acx-ui/components'
import { InformationSolid }                                                         from '@acx-ui/icons'
import { useGetVenueApManagementVlanQuery, useUpdateVenueApManagementVlanMutation } from '@acx-ui/rc/services'
import { validateVlanId }                                                           from '@acx-ui/rc/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../../index'

export function ApManagementVlan (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isAllowEdit=true } = props
  const form = Form.useFormInstance()

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const { data: venueApMgmtData, isLoading: isVenueApMgmtLoading } =
    useGetVenueApManagementVlanQuery({ params: { venueId } })
  const [updateVenueApManagementVlan, { isLoading: isUpdatingVenueManagementVlan }] =
    useUpdateVenueApManagementVlanMutation()

  useEffect(() => {
    if (!isVenueApMgmtLoading && venueApMgmtData) {
      const { vlanId } = venueApMgmtData
      form.setFieldValue('vlanId', vlanId)

      setReadyToScroll?.(r => [...(new Set(r.concat('Access-Point-Management-VLAN')))])
    }

  }, [form, venueApMgmtData, isVenueApMgmtLoading, setReadyToScroll])

  const onFormDataChanged = () => {

    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'settings',
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: true
    })

    setEditAdvancedContextData && setEditAdvancedContextData({
      ...editAdvancedContextData,
      updateApManagementVlan: () => handleUpdateApManagementVlan()
    })
  }

  const getApManagementVlanDataFromFields = () => {
    const {
      vlanId
    } = form.getFieldsValue()

    return {
      vlanId
    }
  }

  const handleUpdateApManagementVlan = async () => {

    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'AP Management VLAN Change' }),
      content:
        $t({ defaultMessage:
          `Modifying the AP management VLAN for managing traffic will
          cause a reboot of all AP devices within this <venueSingular></venueSingular>.
          Please note that incorrect settings between APs and switches could result
          in losing access to your APs. Are you sure you want to continue?` }),
      okText: $t({ defaultMessage: 'Continue' }),
      onOk: async () => {
        try {
          const payload = getApManagementVlanDataFromFields()

          await updateVenueApManagementVlan({
            params: { venueId },
            payload
          }).unwrap()
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    })
  }

  return (
    <Loader states={[{
      isLoading: isVenueApMgmtLoading,
      isFetching: isUpdatingVenueManagementVlan
    }]}>
      <Space align='start'>
        <StepsFormLegacy.FieldLabel
          width='max-content'
          style={{ marginTop: '6px', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}
        >
          <Row>
            <Col span={18}
              style={{
                marginBottom: '10px',
                fontSize: cssStr('--acx-body-4-font-size'),
                padding: '10px 50px 10px 0px',
                color: cssStr('--acx-neutrals-60')
              }}>
              <Form.Item label={$t({ defaultMessage: 'Management VLAN' })}>
                <Form.Item
                  noStyle
                  name='vlanId'
                  rules={[
                    { required: true },
                    { validator: (_, value) => {
                      if (value) return validateVlanId(value)
                      return Promise.resolve()
                    } }
                  ]}
                  children={
                    <InputNumber
                      data-testid='venue-ap-mgmt-vlan'
                      disabled={!isAllowEdit}
                      onChange={onFormDataChanged}
                      style={{ width: '86px' }}
                    />
                  }
                />
              </Form.Item>
              <Space align='start'>
                <InformationSolid />
                {$t({ defaultMessage:
                          `To avoid the isolation of the APs, it is essential to
                           configure the network switches with the corresponding settings.`
                })}
              </Space>
            </Col>
          </Row>
        </StepsFormLegacy.FieldLabel>
      </Space>
    </Loader>
  )
}
