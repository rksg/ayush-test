import React, { useState, useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, StepsForm, TableProps, useStepFormContext } from '@acx-ui/components'
import { useGetAvailableSwitchesQuery }                      from '@acx-ui/rc/services'
import { DistributionSwitch }                                from '@acx-ui/rc/utils'
import { useParams }                                         from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupFormData } from '..'
import { useWatch }                         from '../../useWatch'

import { DistributionSwitchDrawer } from './DistributionSwitchDrawer'
import { DistributionSwitchTable }  from './DistributionSwitchTable'


export function DistributionSwitchForm () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  // const form = Form.useFormInstance()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()

  const [openDrawer, setOpenDrawer] = useState(false)
  const [selected, setSelected] = useState<DistributionSwitch>()
  const [dsList, setDsList] = useState<DistributionSwitch[]>([])
  const distributionSwitchInfos = useWatch('distributionSwitchInfos', form)
  const accessSwitchInfos = useWatch('accessSwitchInfos', form)
  const originalAccessSwitchInfos = useWatch('originalAccessSwitchInfos', form)
  const venueId = useWatch('venueId', form)
  const edgeId = useWatch('edgeId', form)

  const { availableSwitches } = useGetAvailableSwitchesQuery({
    params: { tenantId, venueId }
  }, {
    skip: !venueId,
    selectFromResult: ({ data }) => ({
      availableSwitches: data?.switchViewList?.filter(sw=>
        // filter out switches already selected in this MDU
        !distributionSwitchInfos?.find(ds => ds.id === sw.id) &&
        !accessSwitchInfos?.find(ds => ds.id === sw.id)
      ) || []
    })
  })

  useEffect(()=>{
    if (distributionSwitchInfos) {
      setDsList(distributionSwitchInfos)
    }
  }, [distributionSwitchInfos])

  const rowActions: TableProps<DistributionSwitch>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setSelected(selectedRows[0])
      setOpenDrawer(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows) => {
      setSelected(undefined)
      const newList = dsList?.filter(ds=>{
        return !selectedRows.map(r=>r.id).includes(ds.id)
      })

      saveToContext(newList)
    }
  }]

  const saveToContext = (newList: DistributionSwitch[]) => {
    const newAsList = newList.map(ds => {
      return ds.accessSwitches || []
    }).flat()

    form.setFieldValue('distributionSwitchInfos', newList)
    form.setFieldValue('accessSwitchInfos', newAsList)
  }

  const addHandler = () => {
    setSelected(undefined)
    setOpenDrawer(true)
  }

  const handleSaveDS = (values: DistributionSwitch) => {
    let newList = dsList || []
    if (!selected) { // Add
      newList = newList.concat(values)
    }
    else { // edit
      newList = newList.map(ds => {
        if (selected.id === ds.id) {
          return { ...selected, ...values }
        }
        return ds
      })
    }
    setSelected(undefined)
    setOpenDrawer(false)

    saveToContext(newList)
  }

  return (<>
    <Button type='link' style={{ float: 'right' }} onClick={addHandler}>
      { $t({ defaultMessage: 'Add Distribution Switch' }) }
    </Button>
    <StepsForm.Title>
      {$t({ defaultMessage: 'Distribution Switch Settings' })}
    </StepsForm.Title>
    <DistributionSwitchTable rowActions={rowActions}
      dataSource={dsList}
      rowSelection={{ type: 'radio', selectedRowKeys: selected ? [selected.id] : [] }} />
    <Form.Item name='distributionSwitchInfos'
      rules={[{
        validator: (_, dsList) => {
          return (dsList && dsList.length > 0) ? Promise.resolve() :
            Promise.reject(new Error($t({ defaultMessage:
            'Please add at least 1 distribution switch.' })))
        }
      }]}
    />
    <DistributionSwitchDrawer
      open={openDrawer}
      editRecord={selected}
      availableSwitches={availableSwitches}
      originalAccessSwitches={originalAccessSwitchInfos}
      selectedSwitches={dsList}
      venueId={venueId}
      edgeId={edgeId}
      onSaveDS={handleSaveDS}
      onClose={()=>setOpenDrawer(false)} />
  </>)
}
