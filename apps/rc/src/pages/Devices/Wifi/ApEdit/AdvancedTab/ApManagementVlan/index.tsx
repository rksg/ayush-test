import { useContext, useEffect, useRef, useState } from 'react'

import { Form, InputNumber, Space, Row, Col } from 'antd'
import { useIntl }                            from 'react-intl'
import { useParams }                          from 'react-router-dom'

import { Loader, StepsFormLegacy, cssStr, showActionModal } from '@acx-ui/components'
import { InformationSolid }                                 from '@acx-ui/icons'
import {
  useGetApManagementVlanQuery,
  useUpdateApManagementVlanMutation,
  useLazyGetVenueApManagementVlanQuery
} from '@acx-ui/rc/services'
import { ApManagementVlan } from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'


export function ApManagementVlanForm (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const { isAllowEdit=true } = props
  const VLAN_ID_MIN = 1
  const VLAN_ID_MAX = 4096
  const form = Form.useFormInstance()
  const vlanIdFieldName = 'vlanId'

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(ApEditContext)

  const { venueData } = useContext(ApDataContext)

  const venueLevelDataRef = useRef<ApManagementVlan>()
  const initDataRef = useRef<ApManagementVlan>()
  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const venueId = venueData?.id

  const [getVenueApManagementVlan] = useLazyGetVenueApManagementVlanQuery()
  const getApManagementVlan = useGetApManagementVlanQuery({ params: { venueId, serialNumber } })
  const [updateApManagementVlan, { isLoading: isUpdatingVenueManagementVlan }] =
    useUpdateApManagementVlanMutation()

  useEffect(() => {
    const apMgmtVlanData = getApManagementVlan?.data
    if(apMgmtVlanData) {
      const setData = async () => {
        const venueApMgmtVlan =
          (await getVenueApManagementVlan({ params: { venueId } }, true).unwrap())
        initDataRef.current = apMgmtVlanData
        venueLevelDataRef.current = venueApMgmtVlan
        form.setFieldsValue(apMgmtVlanData)
        setIsUseVenueSettings(apMgmtVlanData.useVenueSettings || false)
        isUseVenueSettingsRef.current = apMgmtVlanData.useVenueSettings || false
      }
      setData()
    }
  }, [venueId, getApManagementVlan?.data])

  const onApMgmtVlanChange = () => {
    onFormDataChanged()
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initDataRef?.current?.useVenueSettings || false)
    isUseVenueSettingsRef.current = initDataRef?.current?.useVenueSettings || false
    setDataToForm({ vlanId: initDataRef.current?.vlanId })
  }

  const onFormDataChanged = async () => {
    const { vlanId } = form.getFieldsValue()
    const invalidVlanId = vlanId === null || vlanId < VLAN_ID_MIN || vlanId > VLAN_ID_MAX
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'advanced',
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: true,
      hasError: invalidVlanId
    })

    setEditAdvancedContextData && setEditAdvancedContextData({
      ...editAdvancedContextData,
      updateApManagementVlan: () => handleUpdateApManagementVlan(),
      discardApManagementVlan: () => handleDiscard()
    })
  }

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue
    let data = {}
    if (isUseVenue) {
      if (venueLevelDataRef.current) {
        data = venueLevelDataRef.current
      }
    } else {
      if (initDataRef.current) {
        data = initDataRef.current
      }
    }

    setDataToForm(data)
    onFormDataChanged()
  }

  const setDataToForm = (data: { vlanId?: number }) => {
    form.setFieldValue(vlanIdFieldName, data.vlanId)
  }

  const handleUpdateApManagementVlan = async () => {
    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'AP Management VLAN' }),
      content:
        // eslint-disable-next-line max-len
        $t({ defaultMessage:
          `Modifying the AP management VLAN for managing traffic will cause a reboot 
          of this AP device. Please note that incorrect settings between APs and switches 
          could result in losing access to your APs. Are you sure you want to continue?` }),
      okText: $t({ defaultMessage: 'Continue' }),
      onOk: async () => {
        try {
          const payload = isUseVenueSettingsRef.current
            ? { useVenueSettings: true }
            : getApManagementVlanDataFromFields()

          await updateApManagementVlan({ params: { venueId, serialNumber }, payload
          }).unwrap()

          // eslint-disable-next-line no-console
          console.log(payload)
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    })
  }

  const getApManagementVlanDataFromFields = () => {
    const { vlanId } = form.getFieldsValue()

    return {
      vlanOverrideEnabled: true,
      vlanId,
      useVenueSettings: isUseVenueSettingsRef.current
    }
  }

  return (
    <Loader states={[{
      isLoading: getApManagementVlan.isLoading,
      isFetching: isUpdatingVenueManagementVlan
    }]}>
      <VenueSettingsHeader venue={venueData}
        disabled={!isAllowEdit}
        isUseVenueSettings={isUseVenueSettings}
        handleVenueSetting={handleVenueSetting} />
      <Space align='start'>
        <StepsFormLegacy.FieldLabel
          width='max-content'
          style={{ marginTop: '6px', display: 'flex', flexDirection: 'column' }}>
          {$t({ defaultMessage: 'AP Management VLAN' })}
          <Row>
            <Col style={{ marginTop: '6px' }}>
              {isUseVenueSettings
                ? <Form.Item
                  dependencies={[vlanIdFieldName]}
                  noStyle
                >
                  {({ getFieldValue }) => <span data-testid={'ap-managment-vlan-vlan-id-span'}>
                    {getFieldValue(vlanIdFieldName)}
                  </span>}
                </Form.Item>
                : <>
                  <Form.Item
                    data-testid={'ap-managment-vlan-vlan-id-input'}
                    name={vlanIdFieldName}
                    style={{ color: 'black' }}
                    rules={[
                      { required: true }
                    ]}
                    children={
                      <InputNumber
                        disabled={!isAllowEdit}
                        onChange={onApMgmtVlanChange}
                        min={VLAN_ID_MIN}
                        max={VLAN_ID_MAX}
                        style={{ width: '86px' }} />
                    }
                  />
                  <Row>
                    <Col
                      span={18}
                      style={{
                        marginBottom: '10px',
                        fontSize: cssStr('--acx-body-4-font-size'),
                        padding: '0px 50px 10px 0px',
                        color: cssStr('--acx-neutrals-60')
                      }}>
                      <Space align='start'>
                        <InformationSolid />
                        {$t({ defaultMessage:
                                  `To avoid the isolation of the APs, it is essential to
                                  configure the network switches with the corresponding settings.`
                        })}
                      </Space>
                    </Col>
                  </Row>
                </>
              }
            </Col>
          </Row>
        </StepsFormLegacy.FieldLabel>
      </Space>
    </Loader>
  )
}
