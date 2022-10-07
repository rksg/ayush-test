import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { useGetVenueExternalAntennaQuery } from '@acx-ui/rc/services'
import { useParams }             from '@acx-ui/react-router-dom'
import { VenueExternalAntenna } from '@acx-ui/rc/utils'

const { Option } = Select

export function ExternalAntenna () {
  const { $t } = useIntl()

  const { selectOptions, selected } = useGetVenueExternalAntennaQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      let selectoptions = data?.map(item => ({ label: item.model, value: item.model })) || []
      selectoptions.unshift({ label: 'No model selected', value: '' })
      return {
        selectOptions: selectoptions?.map(item =>
          <Option key={item.value}>{item.label}</Option>) ?? [],
        selected: ''
      }
    }
  })

  // const onSelectModel = (value: VenueExternalAntenna) => {
  //   if (value) {
  //     const filteredModel = this.allApExternalAntennas.filter(ap => ap.model === value);
  //     this.selectedApExternalAntenna = (filteredModel.length) ? filteredModel[0] : null;
  //     this.selectedApExternalAntennaChanged.emit(this.selectedApExternalAntenna);
  //     this.selectedApCapabilities = this.filterModelCapabilities(value);
  //     this.cd.detectChanges();
  //   } else {
  //     this.selectedApCapabilities = null;
  //     this.selectedApExternalAntenna = null;
  //   }
  // }
  console.log('selected: ', selected)
  return (
    <Form.Item
      name={['external', 'apModel']}
      label={$t({ defaultMessage: 'AP Model' })}
      initialValue={selected}
    >
      <Select
        style={{ width: '280px' }}
        // onChange={onSelectModel}
        children={selectOptions} />
    </Form.Item>
  )
}