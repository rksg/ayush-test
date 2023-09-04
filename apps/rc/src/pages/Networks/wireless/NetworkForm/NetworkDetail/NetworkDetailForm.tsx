import { useContext, useEffect, useState } from 'react'

import { Form, Input, Col, Radio, Row, Space } from 'antd'
import TextArea                                from 'antd/lib/input/TextArea'
import _                                       from 'lodash'
import { useIntl }                             from 'react-intl'

import { Button, StepsFormLegacy, Tooltip, cssStr }                    from '@acx-ui/components'
import { Features, useIsSplitOn }                                      from '@acx-ui/feature-toggle'
import { useLazyGetVenueNetworkApGroupQuery, useLazyNetworkListQuery } from '@acx-ui/rc/services'
import {
  apNameRegExp,
  NetworkTypeEnum,
  WifiNetworkMessages,
  checkObjectNotExists,
  hasGraveAccentAndDollarSign,
  NetworkVenue } from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'

import { networkTypesDescription, networkTypes } from '../contentsMap'
import { NetworkDiagram }                        from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                        from '../NetworkFormContext'
import { RadioDescription }                      from '../styledComponents'

import type { RadioChangeEvent } from 'antd'

const { useWatch } = Form


export function NetworkDetailForm () {
  const intl = useIntl()
  const type = useWatch<NetworkTypeEnum>('type')
  const {
    editMode,
    cloneMode,
    data,
    setData,
    modalMode,
    createType
  } = useContext(NetworkFormContext)

  const [differentSSID, setDifferentSSID] = useState(false)
  const form = Form.useFormInstance()
  const onChange = (e: RadioChangeEvent) => {
    setData && setData({ ...data, type: e.target.value as NetworkTypeEnum,
      enableAccountingProxy: false,
      enableAuthProxy: e.target.value === NetworkTypeEnum.DPSK, // to set default value as true for DPSK while adding new network
      enableAccountingService: false })
  }

  useEffect(() => {
    if (editMode && data?.wlan?.ssid) {
      if (!differentSSID) {
        setDifferentSSID(data?.wlan?.ssid !== data?.name)
      }
    }
  }, [data?.wlan?.ssid, editMode])

  const networkListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name', 'dsaeOnboardNetwork.name'],
    filters: {},
    pageSize: 10000
  }
  const [getNetworkList] = useLazyNetworkListQuery()
  const [getVenueNetrworkApGroupList] = useLazyGetVenueNetworkApGroupQuery()
  const params = useParams()

  const nameValidator = async (value: string) => {
    const payload = { ...networkListPayload, searchString: value }
    const list = (await getNetworkList({ params, payload }, true).unwrap()).data
      .filter(n => n.id !== params.networkId)
      .map(n => n.name)

    return checkObjectNotExists(list, value, intl.$t({ defaultMessage: 'Network' }))
  }

  const ssidValidator = async (value: string) => {
    if (!editMode) { return Promise.resolve() }
    const venues = _.get(data, 'venues') || []
    let payload: {
      venueId: string,
      networkId: string,
      ssids: string[]
    }[] = []

    if (venues.length > 0) {
      venues.forEach((activatedVenue: NetworkVenue) => {
        const venueId = activatedVenue.venueId || ''
        const networkId = _.get(data, 'id') || ''
        payload.push({ venueId, networkId, ssids: [value] })
      })
    }

    let errorsCounter = 0
    const list = (await getVenueNetrworkApGroupList({ params, payload }, true).unwrap())
    const networkApGroup = _.get(list, 'response')
    networkApGroup?.forEach((item: NetworkVenue) => {
      if (item.isAllApGroups && _.get(item, 'validationErrorSsidAlreadyActivated')) {
        errorsCounter++
      } else if (!item.isAllApGroups &&
        item.apGroups
        && item.apGroups.length > 0) {
        item.apGroups.forEach(apGroup => {
          if (apGroup.validationErrorSsidAlreadyActivated) {
            errorsCounter++
          } else {
            errorsCounter = 0
          }
        })
      }
    })

    return errorsCounter === 0 ?
      Promise.resolve() :
      Promise.reject(intl.$t(validationMessages.duplication, {
        entityName: intl.$t({ defaultMessage: 'SSID' }),
        key: intl.$t({ defaultMessage: 'name' }),
        extra: ''
      }))
  }
  const types = [
    { type: NetworkTypeEnum.PSK, disabled: false },
    { type: NetworkTypeEnum.DPSK, disabled: !useIsSplitOn(Features.SERVICES) },
    { type: NetworkTypeEnum.AAA, disabled: !useIsSplitOn(Features.POLICIES) },
    { type: NetworkTypeEnum.CAPTIVEPORTAL, disabled: !useIsSplitOn(Features.SERVICES) },
    { type: NetworkTypeEnum.OPEN, disabled: false }
  ]

  const nameOnChange = (differentSSID: boolean) => {
    if (!differentSSID) {
      const name = form.getFieldValue('name')
      form.setFieldValue(['wlan', 'ssid'], name)
    }
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsFormLegacy.Title children={intl.$t({ defaultMessage: 'Network Details' })} />
        <Form.Item
          name='name'
          style={{ marginBottom: '5px' }}
          label={<>
            { intl.$t({ defaultMessage: 'Network Name' }) }
            <Tooltip.Question
              title={intl.$t(WifiNetworkMessages.NETWORK_NAME_TOOLTIP)}
              placement='bottom'
            />
          </>}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) },
            { validator: (_, value) => hasGraveAccentAndDollarSign(value) },
            { validator: (_, value) => apNameRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input onChange={() => nameOnChange(differentSSID)} />}
          validateTrigger={'onBlur'}
        />
        <Form.Item noStyle name='differentSSID'>
          <Button
            type='link'
            style={{ fontSize: cssStr('--acx-body-4-font-size') }}
            onClick={() => {
              nameOnChange(!differentSSID)
              setDifferentSSID(!differentSSID)
            }}
          >
            {differentSSID ?
              intl.$t({ defaultMessage: 'Same as network name' }) :
              intl.$t({ defaultMessage: 'Set different SSID' })}
          </Button>

        </Form.Item>
        {differentSSID &&
          <Form.Item
            name={['wlan', 'ssid']}
            label={<>
              {intl.$t({ defaultMessage: 'SSID' })}
              <Tooltip.Question
                placement='bottom'
                title={intl.$t({
                  // eslint-disable-next-line max-len
                  defaultMessage: 'SSID may contain between 2 and 32 characters (32 Bytes when using UTF-8 non-Latin characters)'
                })}
              />
            </>}
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'The SSID must be configured.' }) },
              { min: 2,
                message: intl.$t({ defaultMessage: 'The SSID must be at least 2 characters' }) },
              { max: 32,
                message: intl.$t({ defaultMessage: 'The SSID must be up to 32 characters' }) },
              { validator: (_, value) => ssidValidator(value) },
              { validator: (_, value) => hasGraveAccentAndDollarSign(value) },
              { validator: (_, value) => apNameRegExp(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
            validateTrigger={'onBlur'}
          />
        }
        <Form.Item
          name='description'
          label={intl.$t({ defaultMessage: 'Description' })}
          children={<TextArea rows={4} maxLength={64} />}
        />
        <Form.Item>
          {( !editMode && !cloneMode && !modalMode ) &&
            <Form.Item
              name='type'
              label={intl.$t({ defaultMessage: 'Network Type' })}
              rules={[{ required: true }]}
            >
              <Radio.Group onChange={onChange}>
                <Space direction='vertical'>
                  {types.filter(type => !type.disabled).map(({ type }) => (
                    <Radio key={type} value={type}>
                      {intl.$t(networkTypes[type])}
                      <RadioDescription>
                        {intl.$t(networkTypesDescription[type])}
                      </RadioDescription>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          }
          {( editMode || cloneMode ) &&
            <Form.Item name='type' label='Network Type'>
              <>
                <h4 className='ant-typography'>{type && intl.$t(networkTypes[type])}</h4>
                <label>{type && intl.$t(networkTypesDescription[type])}</label>
              </>
            </Form.Item>
          }
          {modalMode &&
            <Form.Item name='type' label='Network Type'>
              <>
                <h4 className='ant-typography'>
                  {createType && intl.$t(networkTypes[createType])}</h4>
                <label>{createType && intl.$t(networkTypesDescription[createType])}</label>
              </>
            </Form.Item>
          }
        </Form.Item>
      </Col>

      <Col span={14}>
        <NetworkDiagram />
      </Col>
    </Row>
  )
}


