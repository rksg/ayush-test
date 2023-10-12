import { useContext, useEffect } from 'react'

import { InputNumber, Form, Radio, Space, Row, Col } from 'antd'
import { FormattedMessage, useIntl }                 from 'react-intl'
import { useParams }                                 from 'react-router-dom'

import { Loader, StepsFormLegacy, cssStr, showActionModal }                         from '@acx-ui/components'
import { InformationSolid }                                                         from '@acx-ui/icons'
import { useGetVenueApManagementVlanQuery, useUpdateVenueApManagementVlanMutation } from '@acx-ui/rc/services'

import { VenueEditContext } from '../../../index'
import { color } from 'echarts'
import { textAlign } from 'libs/rc/shared/components/src/NetworkSegmentationServiceInfo/styledComponents'

const { useWatch } = Form

export function ApManagementVlan () {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const form = Form.useFormInstance()
  const [ apMgmtVlanOverrideEnabled ] = [
    useWatch('vlanOverrideEnabled')
  ]

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)

  const getVenueApManagementVlan = useGetVenueApManagementVlanQuery({ params: { venueId } })
  const [updateVenueApManagementVlan, { isLoading: isUpdatingVenueManagementVlan }] =
    useUpdateVenueApManagementVlanMutation()

  useEffect(() => {
    const venueMgmtVlanApData = getVenueApManagementVlan?.data
    if (!getVenueApManagementVlan?.isLoading) {
      form.setFieldsValue(venueMgmtVlanApData)
    }

  }, [form, getVenueApManagementVlan?.data, getVenueApManagementVlan?.isLoading])

  const onApMgmtVlanChange = () => {
    onFormDataChanged()
  }

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
      vlanOverrideEnabled,
      vlanId
    } = form.getFieldsValue()

    return {
      vlanOverrideEnabled,
      vlanId
    }
  }

  const handleUpdateApManagementVlan = async () => {

    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'AP Management VLAN' }),
      content:
        // eslint-disable-next-line max-len
        $t({ defaultMessage:
          `The VLAN tag configuration for managing traffic will be applied
           throughout the venue. An incorrect settings between APs and
           switches could result in losing access to your APs. Are you sure
           you want to continue?` }),
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
      isLoading: getVenueApManagementVlan.isLoading,
      isFetching: isUpdatingVenueManagementVlan
    }]}>
      <Space align='start'>
        <StepsFormLegacy.FieldLabel
          width='max-content'
          style={{ marginTop: '6px', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}
        >
          <Form.Item
            name='vlanOverrideEnabled'
            label={$t({ defaultMessage: 'AP Management VLAN' })}
            style={{ color: 'black' }}
          >
            <Radio.Group onChange={onApMgmtVlanChange}>
              <Space direction='vertical'>
                <Radio value={false} style={{ marginTop: '6px' }}>
                  {$t({ defaultMessage: 'Use AP’s settings' })}
                </Radio>
                <Radio value={true}>
                  {$t({ defaultMessage: 'VLAN ID' })}
                  {apMgmtVlanOverrideEnabled && <Form.Item noStyle
                    name='vlanId'
                    rules={[{
                      required: true,
                      message: $t({
                        defaultMessage: 'Please enter a number between 1 and 4094'
                      })
                    }]}
                    initialValue={1}
                    children={<InputNumber
                      min={1}
                      max={4094}
                      onChange={onFormDataChanged}
                      style={{
                        width: '81px',
                        marginLeft: '13px'
                      }}/>}
                  />}
                </Radio>
                <Row>
                  <Col span={18}
                    style={{
                      marginBottom: '10px',
                      fontSize: cssStr('--acx-body-4-font-size'),
                      padding: '10px 50px 10px 0px',
                      color: cssStr('--acx-neutrals-60')
                    }}>
                    <Space align='start'>
                      <InformationSolid />
                      <div>
                        <FormattedMessage
                          defaultMessage={
                            `To avoid the isolation of the APs, it is essential
                         configure the network switches with the corresponding settings.`
                          }
                          values={{
                            b: (text: string) => <strong>{text}</strong>
                          }}
                        />
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Space>
            </Radio.Group>
          </Form.Item>
        </StepsFormLegacy.FieldLabel>
      </Space>
    </Loader>
  )
}
