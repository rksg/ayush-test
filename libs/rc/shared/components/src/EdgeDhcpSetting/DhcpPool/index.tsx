import { useState } from 'react'

import { Form }         from 'antd'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { Features, useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { EdgeDhcpPool, IpInSubnetPool, networkWifiIpRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'
import { validationMessages }                                                    from '@acx-ui/utils'

import { useTableControl }                                 from '..'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../../ImportFileDrawer'

import { PoolDrawer } from './PoolDrawer'
import { PoolTable }  from './PoolTable'

type DhcpPoolTableProps = {
  value?: EdgeDhcpPool[]
  onChange?: (data: EdgeDhcpPool[]) => void
}

const importTemplateLink = 'assets/templates/edge_dhcp_import_template.csv'
const MAX_IMPORT_ENTRIES = 128
export default function DhcpPoolTable ({
  value = [],
  onChange
}: DhcpPoolTableProps) {
  const { $t } = useIntl()
  const isDHCPCSVEnabled = useIsSplitOn(Features.EDGES_DHCP_CSV_TOGGLE)
  const [importModalvisible, setImportModalvisible] = useState<boolean>(false)
  const form = Form.useFormInstance()
  const {
    openDrawer,
    onDelete,
    visible,
    setVisible,
    onAddOrEdit,
    currentEditData
  } = useTableControl<EdgeDhcpPool>({ value, onChange })

  const validateCSVData = async (data: EdgeDhcpPool[]): Promise<void> => {
    const isRelayOn = form.getFieldValue('dhcpRelay')

    // find duplicate pool name
    const count = data.concat(value).reduce((result, item) => ({ ...result,
      [item.poolName]: (result[item.poolName] || 0) + 1
    }), {} as { [key:string]: number })
    const hasDuplicates = Object.keys(count).filter((a) => count[a] > 1).length > 0
    if (hasDuplicates) {
      return Promise.reject($t(validationMessages.duplication, {
        entityName: $t({ defaultMessage: 'Pool Name' }),
        key: $t({ defaultMessage: 'name' }),
        extra: ''
      }))
    }

    // validation on other fields
    for(let i = 0; i < data.length; i++) {
      const item = data[i]

      // requirement check
      if (!item.poolName || !item.subnetMask
        || !item.poolStartIp || !item.poolEndIp
        || (!isRelayOn && !item.gatewayIp)) {
        return Promise.reject($t({
          defaultMessage: 'some required field(s) are empty.'
        }))
      }

      // dependency between relay and gateway
      if (isRelayOn && item.gatewayIp) {
        return Promise.reject($t({
          defaultMessage: '{data} : gateway should be empty when relay is enabled.'
        }, { data: item.poolName }))
      }

      try {
        await subnetMaskIpRegExp(item.subnetMask)
        await networkWifiIpRegExp(item.poolStartIp)
        await networkWifiIpRegExp(item.poolEndIp)
        await networkWifiIpRegExp(item.gatewayIp)
        await IpInSubnetPool(
          item.poolEndIp,
          item.poolStartIp,
          item.subnetMask
        )
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return Promise.resolve()
  }

  const mapCSVToModel = (content: string):EdgeDhcpPool[] => {
    const onlyCommaSpaceRegex = /^(,*\s*)*$/
    const dataArray = content.split(/\r?\n|\r/).filter(row => {
      const trimmed = row.trim()
      return trimmed
            && !trimmed.startsWith('#')
            && !onlyCommaSpaceRegex.test(trimmed)
            && trimmed !== 'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway'
    })

    return dataArray.map((item) => {
      const fields = item.split(',')
      return {
        id: '_NEW_'+uuidv4(),
        poolName: fields[0],
        subnetMask: fields[1],
        poolStartIp: fields[2],
        poolEndIp: fields[3],
        gatewayIp: fields[4]
      } as EdgeDhcpPool
    })
  }

  const importContentValidator = (content: string) => {
    const dataArray = mapCSVToModel(content)
    if (dataArray.length > MAX_IMPORT_ENTRIES) {
      return Promise.reject($t({ defaultMessage: 'Exceed maximum entries.' }))
    }

    return validateCSVData(dataArray)
  }

  const importHandler = (formData: FormData, values: object, content?: string) => {
    const dataArray = mapCSVToModel(content!)
    onChange && onChange(value.concat(dataArray))
    setImportModalvisible(false)
  }

  return (
    <>
      <Form.Item
        noStyle
        dependencies={['dhcpRelay']}
      >
        {({ getFieldValue }) => {
          const isRelayOn = getFieldValue('dhcpRelay')

          return <>
            <PoolTable
              data={value}
              openDrawer={openDrawer}
              openImportModal={setImportModalvisible}
              onDelete={onDelete}
              isRelayOn={isRelayOn}
            />
            <PoolDrawer
              visible={visible}
              setVisible={setVisible}
              onAddOrEdit={onAddOrEdit}
              data={currentEditData}
              allPool={value}
              isRelayOn={isRelayOn}
            />
          </>
        }}
      </Form.Item>
      {isDHCPCSVEnabled &&
        <ImportFileDrawer
          type={ImportFileDrawerType.EdgeDHCP}
          title={$t({ defaultMessage: 'Import from file' })}
          maxSize={CsvSize['5MB']}
          maxEntries={MAX_IMPORT_ENTRIES}
          acceptType={['csv']}
          templateLink={importTemplateLink}
          visible={importModalvisible}
          readAsText={true}
          skipCsvTextConvert={true}
          validator={importContentValidator}
          importRequest={importHandler}
          onClose={() => setImportModalvisible(false)}
        />}
    </>
  )
}
