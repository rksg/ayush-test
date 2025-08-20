import { useState, useEffect } from 'react'

import { Button, Col, Form, Input, Row, Select, Checkbox, Typography } from 'antd'
import { useIntl }                                                     from 'react-intl'

import { Drawer, cssStr }             from '@acx-ui/components'
import {
  useVenuesListQuery,
  useApGroupsListQuery,
  useImportApProvisionsMutation,
  useImportSwitchProvisionsMutation
} from '@acx-ui/rc/services'
import { validateTags } from '@acx-ui/rc/utils'

interface Device {
  serial: string
  model: string
}

interface DeviceFormData {
  order: number
  customApName?: string
  tags?: string[]
  serialNumber: string
  model: string
}

interface ClaimDeviceDrawerProps {
  onClose: () => void
  devices: Device[]
  visible?: boolean
  deviceType?: 'ap' | 'switch' // 'ap' for access points, 'switch' for switches
  onAddVenue?: () => void // Callback to open venue drawer from parent
  onAddApGroup?: () => void // Callback to open AP group drawer from parent
}

const { Text } = Typography

export const ClaimDeviceDrawer = (props: ClaimDeviceDrawerProps) => {
  const {
    onClose,
    devices,
    visible = true,
    deviceType = 'ap',
    onAddVenue,
    onAddApGroup
  } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [selectedVenueId, setSelectedVenueId] = useState<string>('')
  const [usePrefixSuffix, setUsePrefixSuffix] = useState<boolean>(false)
  const [prefix, setPrefix] = useState<string>('')
  const [suffix, setSuffix] = useState<string>('')
  // API mutations
  const [importApProvisions, { isLoading: isImportingAp }] = useImportApProvisionsMutation()
  const [importSwitchProvisions,
    { isLoading: isImportingSwitch }] = useImportSwitchProvisionsMutation()

  // Combined loading state
  const isClaiming = isImportingAp || isImportingSwitch

  // Fetch venues list
  const { data: venuesList, isLoading: isVenuesLoading } = useVenuesListQuery({
    params: {},
    payload: {
      fields: ['name', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  // Fetch AP groups for selected venue (only for AP devices)
  const { data: apGroupsList, isLoading: isApGroupsLoading } =
    useApGroupsListQuery(
      {
        params: {},
        payload: {
          fields: ['name', 'id', 'venueId', 'isDefault'],
          pageSize: 10000,
          sortField: 'name',
          sortOrder: 'ASC',
          filters: selectedVenueId ? { venueId: [selectedVenueId] } : {}
        }
      },
      {
        skip: !selectedVenueId || deviceType === 'switch'
      }
    )

  // Prepare venue options
  const venueOptions = venuesList?.data?.map(venue => ({
    label: venue.name,
    value: venue.id
  })) || []

  // Prepare AP group options
  const apGroupOptions = apGroupsList?.data?.map(apGroup => ({
    label: apGroup.isDefault
      ? $t({ defaultMessage: 'No group (inherit from <VenueSingular></VenueSingular>)' })
      : apGroup.name,
    value: apGroup.id
  })) || []

  // Handle venue change
  const handleVenueChange = (venueId: string) => {
    setSelectedVenueId(venueId)
  }

  // Handle add venue button click
  const handleAddVenue = () => {
    if (onAddVenue) {
      onAddVenue()
    }
  }

  // Handle add AP group button click
  const handleAddApGroup = () => {
    if (onAddApGroup) {
      onAddApGroup()
    }
  }

  // Set default AP group when AP groups data is loaded
  useEffect(() => {
    if (deviceType === 'ap' && selectedVenueId && apGroupsList?.data) {
      const defaultApGroup = apGroupsList.data.find(apGroup => apGroup.isDefault)
      if (defaultApGroup) {
        form.setFieldValue('apGroupId', defaultApGroup.id)
      } else {
        form.setFieldValue('apGroupId', undefined)
      }
    }
  }, [selectedVenueId, apGroupsList?.data, deviceType, form])

  // Handle checkbox change for using serial as custom AP name
  const handleUseSerialAsNameChange = (checked: boolean) => {
    const devices = form.getFieldValue('devices') || []

    const updatedDevices = devices.map((device: DeviceFormData) => {
      let customApName = device.customApName

      if (checked) {
        // If checked, use serial number as custom name
        customApName = device.serialNumber
      } else {
        // If unchecked, clear the custom name
        customApName = undefined
      }

      return {
        ...device,
        customApName
      }
    })
    form.setFieldValue('devices', updatedDevices)

    // Clear validation errors when checkbox is checked
    if (checked) {
      const devices = form.getFieldValue('devices') || []
      devices.forEach((_: DeviceFormData, index: number) => {
        form.setFields([{
          name: ['devices', index, 'customApName'],
          errors: []
        }])
      })
    }
  }

  // Handle checkbox change for using prefix.suffix pattern
  const handleUsePrefixSuffixChange = (checked: boolean) => {
    setUsePrefixSuffix(checked)
  }

  // Handle prefix change for example display
  const handlePrefixChange = (value: string) => {
    setPrefix(value)
  }

  // Handle suffix change for example display
  const handleSuffixChange = (value: string) => {
    setSuffix(value)
  }

  // Handle cancel button click
  const handleCancel = () => {
    // Reset form to initial state
    form.resetFields()

    // Reset local state
    setSelectedVenueId('')
    setUsePrefixSuffix(false)
    setPrefix('')
    setSuffix('')
    // Close the drawer
    onClose()
  }

  // Initialize form with device data
  useEffect(() => {
    if (!visible) return // Don't initialize if drawer is not visible

    const initialDevices = devices.map((device, index) => ({
      order: index + 1,
      customApName: undefined,
      tags: undefined,
      serialNumber: device.serial,
      model: device.model
    }))

    form.setFieldsValue({
      usePrefixSuffix: false,
      useSerialAsName: false,
      prefix: '',
      suffix: '',
      devices: initialDevices
    })
    setUsePrefixSuffix(false)
    setPrefix('')
    setSuffix('')
    setSelectedVenueId('') // Reset selected venue
  }, [devices, form, visible]) // Add visible as dependency

  const handleApply = async () => {
    try {
      const useSerialAsName = form.getFieldValue('useSerialAsName')
      const usePrefixSuffix = form.getFieldValue('usePrefixSuffix')
      const prefix = form.getFieldValue('prefix') || ''
      const suffix = form.getFieldValue('suffix') || ''
      const venueId = form.getFieldValue('venueId')
      let apGroupId = form.getFieldValue('apGroupId')

      // Collect all validation errors
      const allErrors: Array<{ name: (string | number)[], errors: string[] }> = []

      // Validate required fields first
      if (!venueId) {
        allErrors.push({
          name: ['venueId'],
          errors: [$t({ defaultMessage: 'Please select a <venueSingular></venueSingular>' })]
        })
      }

      // For AP devices, ensure we have a valid apGroupId
      if (deviceType === 'ap') {
        if (!apGroupId && apGroupsList?.data) {
          // Find the default AP group for the selected venue
          const defaultApGroup = apGroupsList.data.find(apGroup =>
            apGroup.venueId === venueId && apGroup.isDefault
          )
          if (defaultApGroup) {
            apGroupId = defaultApGroup.id
          } else {
            allErrors.push({
              name: ['apGroupId'],
              errors: [$t({ defaultMessage: 'No default AP group found' })]
            })
          }
        }
      }

      // Get final form data
      const formData = form.getFieldsValue()
      const devices = formData.devices || []

      // Validate device names and generate final names
      const finalNames: string[] = []

      devices.forEach((device: DeviceFormData, index: number) => {
        let finalName = device.customApName || ''

        if (useSerialAsName) {
          // Use serial number as custom AP name
          finalName = device.serialNumber
        }

        if (usePrefixSuffix) {
          // Apply prefix and suffix to the current finalName
          finalName = `${prefix}${finalName}${suffix}`
        }

        finalNames.push(finalName)

        // Check if final combined name is required (when not using serial as name)
        if (!useSerialAsName && !finalName) {
          allErrors.push({
            name: ['devices', index, 'customApName'],
            errors: [deviceType === 'ap'
              ? $t({ defaultMessage: 'Custom AP Name is required' })
              : $t({ defaultMessage: 'Custom Switch Name is required' })
            ]
          })
          return
        }

        // Validate final name based on device type
        if (deviceType === 'ap') {
          // AP validation: 2-32 chars, specific format (same as apNameRegExp)
          const apNameRegex = new RegExp('(?=^((?!`|\\$\\()[ -_a-~]){2,32}$)^(\\S.*\\S)$')
          if (finalName !== '' && !apNameRegex.test(finalName)) {
            allErrors.push({
              name: ['devices', index, 'customApName'],
              errors: [$t({ defaultMessage: 'Invalid AP name format' })]
            })
          }
        } else {
          // Switch validation: 1-255 characters
          const trimmedName = finalName.trim()
          if (trimmedName.length < 1) {
            allErrors.push({
              name: ['devices', index, 'customApName'],
              errors: [$t({ defaultMessage: 'Switch name must be at least 1 character' })]
            })
          } else if (trimmedName.length > 255) {
            allErrors.push({
              name: ['devices', index, 'customApName'],
              errors: [$t({ defaultMessage: 'Switch name must be 255 characters or less' })]
            })
          }
        }

        // Check for duplicate names
        const duplicateIndex = finalNames.findIndex((name, i) => i !== index && name === finalName)
        if (duplicateIndex !== -1) {
          allErrors.push({
            name: ['devices', index, 'customApName'],
            errors: [$t({ defaultMessage: 'Device name must be unique' })]
          })
        }
      })

      // Set all validation errors at once
      if (allErrors.length > 0) {
        // Set all errors at once
        form.setFields(allErrors)
        // Force form to re-validate to show errors
        form.validateFields(['devices']).catch(() => {
          // Ignore validation errors, just trigger re-render
        })
        return
      }

      // Now validate the form fields after custom validation passes
      await form.validateFields()

      // Create new payload with final names
      const payload = {
        devices: devices.map((device: DeviceFormData, index: number) => {
          return {
            name: finalNames[index],
            serial: device.serialNumber,
            tags: device.tags || []
          }
        })
      }

      // Call the appropriate API based on device type
      if (deviceType === 'ap') {
        await importApProvisions({
          params: {
            venueId,
            apGroupId
          },
          payload
        }).unwrap()
      } else {
        await importSwitchProvisions({
          params: {
            venueId
          },
          payload
        }).unwrap()
      }

      // Close drawer after successful API call
      onClose()

      // Reset all states after successful API call
      form.resetFields()
      setSelectedVenueId('')
      setUsePrefixSuffix(false)
      setPrefix('')
      setSuffix('')
    } catch (error) {
      // Handle validation errors - they will be automatically displayed by Ant Design Form
      // The error object contains validation information that Ant Design will display
      // eslint-disable-next-line no-console
      console.log('Form validation error:', error)
    }
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Claim Device' })}
      width={600}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          onCancel={handleCancel}
          onSave={async () => {
            await handleApply()
          }}
          buttonLabel={{
            cancel: $t({ defaultMessage: 'Cancel' }),
            save: $t({ defaultMessage: 'Claim' })
          }}
          disableCancelBtn={isClaiming}
        />
      }
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          usePrefixSuffix: false,
          useSerialAsName: false
        }}
      >
        {/* Venue Selection */}
        <Row gutter={16}>
          <Col span={24}>
            <div style={{
              fontSize: cssStr('--acx-body-3-font-size'),
              fontWeight: '500',
              color: cssStr('--acx-neutrals-80'),
              marginBottom: '16px'
            }}>
              {deviceType === 'ap'
                ? $t({
                  defaultMessage:
                      'Select a <venueSingular></venueSingular> to add your new access points:'
                })
                : $t({
                  defaultMessage:
                      'Select a <venueSingular></venueSingular> to add your new switches:'
                })
              }
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={11}>
            <Form.Item
              name='venueId'
              label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
              rules={[{
                required: true,
                message: $t({
                  defaultMessage: 'Please select a <venueSingular></venueSingular>'
                })
              }]}
            >
              <Select
                options={venueOptions}
                loading={isVenuesLoading}
                onChange={handleVenueChange}
              />
            </Form.Item>
          </Col>
          <Col span={4} style={{ display: 'flex', alignItems: 'end', paddingBottom: '24px' }}>
            <Button type='link' onClick={handleAddVenue}>
              {$t({ defaultMessage: 'Add' })}
            </Button>
          </Col>
        </Row>

        {/* AP Group Selection - only for AP devices */}
        {deviceType === 'ap' && (
          <Row gutter={16}>
            <Col span={11}>
              <Form.Item
                name='apGroupId'
                label={$t({ defaultMessage: 'AP Group' })}
                initialValue={null}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select an AP Group' })
                }]}
              >
                <Select
                  options={selectedVenueId ? apGroupOptions : []}
                  loading={isApGroupsLoading}
                  disabled={!selectedVenueId || apGroupOptions.length <= 1}
                />
              </Form.Item>
            </Col>
            <Col span={4} style={{ display: 'flex', alignItems: 'end', paddingBottom: '24px' }}>
              <Button type='link' onClick={handleAddApGroup}>
                {$t({ defaultMessage: 'Add' })}
              </Button>
            </Col>
          </Row>
        )}

        {/* Device Count */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
            >
              <Text>
                {$t({ defaultMessage: 'Devices ({count})' }, {
                  count: devices.length
                })}
              </Text>
            </Form.Item>
          </Col>
        </Row>

        {/* Checkboxes */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name='usePrefixSuffix'
              valuePropName='checked'
            >
              <Checkbox onChange={(e) => handleUsePrefixSuffixChange(e.target.checked)}>
                {$t({ defaultMessage: 'Use Prefix/Suffix for Device Names' })}
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Prefix and Suffix inputs - only show when usePrefixSuffix is checked */}
        {usePrefixSuffix && (
          <>
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item
                  name='prefix'
                  label={$t({ defaultMessage: 'Prefix' })}
                >
                  <Input
                    onChange={(e) => handlePrefixChange(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  name='suffix'
                  label={$t({ defaultMessage: 'Suffix' })}
                >
                  <Input
                    onChange={(e) => handleSuffixChange(e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Example display */}
            {(prefix || suffix) && (
              <Row gutter={16}>
                <Col span={24}>
                  <div style={{
                    backgroundColor: 'var(--acx-accents-blue-10)',
                    padding: '8px 12px',
                    borderRadius: '8px'
                  }}>
                    <Text style={{ fontSize: '14px' }}>
                      <span style={{ color: cssStr('--acx-accents-blue-55'), fontWeight: 'bold' }}>
                        {prefix}
                      </span>
                      <span style={{ color: '#333333' }}>
                        [ Custom name ]
                      </span>
                      <span style={{ color: cssStr('--acx-accents-blue-55'), fontWeight: 'bold' }}>
                        {suffix}
                      </span>
                    </Text>
                  </div>
                </Col>
              </Row>
            )}
          </>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name='useSerialAsName'
              valuePropName='checked'
            >
              <Checkbox onChange={(e) => handleUseSerialAsNameChange(e.target.checked)}>
                {deviceType === 'ap'
                  ? $t({ defaultMessage: 'Use Serial # as Custom AP Name' })
                  : $t({ defaultMessage: 'Use Serial # as Custom Switch Name' })
                }
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Devices Form List */}
        <Form.List name='devices'>
          {(fields) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={2}>
                    <Form.Item
                      {...restField}
                      name={[name, 'order']}
                      label={' '}
                    >
                      <Text>{name + 1}.</Text>
                    </Form.Item>
                  </Col>
                  <Col span={deviceType === 'ap' ? 6 : 8}>
                    <Form.Item
                      style={{ marginLeft: '-18px' }}
                      {...restField}
                      name={[name, 'customApName']}
                      label={deviceType === 'ap'
                        ? $t({ defaultMessage: 'Custom AP Name' })
                        : $t({ defaultMessage: 'Custom Switch Name' })
                      }
                    >
                      <Input
                        disabled={form.getFieldValue('useSerialAsName')}
                      />
                    </Form.Item>
                  </Col>
                  {deviceType === 'ap' && (
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'tags']}
                        label={$t({ defaultMessage: 'Tags' })}
                        rules={[{
                          validator: (_, value) => validateTags(value)
                        }]}
                      >
                        <Select mode='tags' maxLength={24} />
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={deviceType === 'ap' ? 11 : 14} style={{ paddingRight: 0 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'serialNumber']}
                      label={
                        <div style={{ display: 'flex' }}>
                          <div style={{
                            flex: deviceType === 'ap' ? '0 0 66.67%' : '0 0 60%',
                            paddingLeft: '8px' }}>
                            {$t({ defaultMessage: 'Serial #' })}
                          </div>
                          <div style={{
                            flex: deviceType === 'ap' ? '0 0 33.33%' : '0 0 40%',
                            textAlign: 'left',
                            paddingLeft: deviceType === 'ap' ? '65px' : '67px'
                          }}>
                            {$t({ defaultMessage: 'Model' })}
                          </div>
                        </div>
                      }
                    >
                      <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '4px 11px',
                        borderRadius: '6px',
                        minHeight: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        <div style={{ flex: deviceType === 'ap' ? '0 0 66.67%' : '0 0 50%' }}>
                          <Text>{form.getFieldValue(['devices', name, 'serialNumber'])}</Text>
                        </div>
                        <div style={{ flex: deviceType === 'ap' ?
                          '0 0 33.33%' : '0 0 50%', textAlign: 'left' }}>
                          <Text>{form.getFieldValue(['devices', name, 'model'])}</Text>
                        </div>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </>
          )}
        </Form.List>
      </Form>
    </Drawer>
  )
}