import React, {
  useCallback,
  useContext,
  useState
} from 'react'

import {
  Row, Col, Form
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Modal, SearchBar }            from '@acx-ui/components'
import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'
import { useGetWifiCallingServiceListQuery }   from '@acx-ui/rc/services'
import { WifiCallingSetting }                  from '@acx-ui/rc/utils'

import { WifiCallingSettingContext } from './ServicesForm'

export function WifiCallingSettingModal () {
  const form = Form.useFormInstance()
  const params = useParams()
  const { $t } = useIntl()
  const { wifiCallingSettingList, setWifiCallingSettingList }= useContext(WifiCallingSettingContext)
  const { data } = useGetWifiCallingServiceListQuery({
    params: params
  })
  const initData = data ? data.slice() : []
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [availableItem, setAvailableItem] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [candidateList, setCandidateList] = useState<WifiCallingSetting[]>(
    wifiCallingSettingList.length > 0 ? [...wifiCallingSettingList] : []
  )

  const handleAvailableList = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAvailableItem(event.target.value)
    setSelectedItem('')
  }

  const handleSelectedList = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItem(event.target.value)
    setAvailableItem('')
  }

  const handleAddAction = useCallback(() => {
    if (availableItem && initData) {
      const dataIndex = initData.findIndex(wifiCallingSetting =>
        wifiCallingSetting.serviceName === availableItem)
      if (dataIndex !== -1) {
        candidateList.push(initData[dataIndex])
        initData.splice(dataIndex, 1)
      }
    }

    setAvailableItem('')
  }, [candidateList, initData, availableItem])

  const handleRemoveAction = useCallback(() => {
    if (selectedItem && candidateList.length) {
      const candidateIndex = candidateList.findIndex(wifiCallingSetting =>
        wifiCallingSetting.serviceName === selectedItem)
      if (candidateIndex !== -1) {
        candidateList.splice(candidateIndex, 1)
      }
    }

    setSelectedItem('')
  }, [candidateList, initData, selectedItem])

  const modalContent = <Row gutter={24} justify='space-between'>
    <Col span={10}>
      <p>{$t({ defaultMessage: 'Available Profiles' })}</p>
      <SearchBar onChange={setSearch}/>
      <select name='availableProfilesList'
        data-testid='availableProfileList'
        size={8}
        onChange={handleAvailableList}
        style={{ width: '100%', marginTop: '10px' }}>
        {initData && initData
          .filter((wifiCallingSetting) => {
            return wifiCallingSetting.serviceName?.toLowerCase().indexOf(search) !== -1
          })
          .map((wifiCallingSetting) => {
            return <option
              data-testid={'avail_' + wifiCallingSetting.serviceName}
              key={wifiCallingSetting.id}
              value={wifiCallingSetting.serviceName}>
              {wifiCallingSetting.serviceName}
            </option>
          })}
      </select>
    </Col>
    <Col span={4}>
      <p style={{ height: '88px' }}/>
      <Button size={'middle'}
        icon={<ArrowChevronRight />}
        disabled={selectedItem !== ''}
        onClick={handleAddAction}
        style={{ width: '100%', justifyContent: 'center' }}>
        {$t({ defaultMessage: 'Add' })}
      </Button>
      <Button size={'middle'}
        icon={<ArrowChevronLeft />}
        disabled={availableItem !== ''}
        onClick={handleRemoveAction}
        style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
        {$t({ defaultMessage: 'Remove' })}
      </Button>
    </Col>
    <Col span={10}>
      <p>{$t({ defaultMessage: 'Selected Profiles' })}</p>
      <p style={{ height: '18px' }}/>
      <select name='selectedProfileList'
        data-testid='selectedProfileList'
        size={8}
        onChange={handleSelectedList}
        style={{ width: '100%', marginTop: '10px' }}>
        {candidateList && candidateList.map((wifiCallingSetting) => {
          return <option
            data-testid={'selected_' + wifiCallingSetting.serviceName}
            key={wifiCallingSetting.id}
            value={wifiCallingSetting.serviceName}>
            {wifiCallingSetting.serviceName}
          </option>
        })}
      </select>
    </Col>
  </Row>

  const showModal = () => {
    setVisible(true)
  }

  const handleOk = () => {
    data && setWifiCallingSettingList([...candidateList])
    setVisible(false)
    form.setFieldValue(
      ['wlan', 'advancedCustomization', 'wifiCallingIds'],
      candidateList.map(service => service.id)
    )
  }

  const handleCancel = () => {
    setVisible(false)
    setCandidateList([...wifiCallingSettingList])
  }

  return (
    <>
      <Button type='link'
        onClick={showModal}
        style={{ paddingLeft: '10px', justifyContent: 'left' }}
      >
        {$t({ defaultMessage: 'Select profiles' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Select Wi-Fi Calling Profiles' })}
        visible={visible}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={handleCancel}
        onOk={handleOk}
        width={850}
      >
        {modalContent}
      </Modal>
    </>
  )
}
