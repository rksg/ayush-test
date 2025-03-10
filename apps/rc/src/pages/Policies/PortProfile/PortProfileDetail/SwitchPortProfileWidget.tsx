import { useIntl } from 'react-intl'

import { GridRow, GridCol, Loader, SummaryCard, Tooltip } from '@acx-ui/components'
import { SwitchPortProfiles }                             from '@acx-ui/rc/utils'

interface SwitchPortProfileWidgetProps {
  data?: SwitchPortProfiles
  isLoading: boolean
}

export default function SwitchPortProfileWidget (props: SwitchPortProfileWidgetProps){
  const { $t } = useIntl()
  const { data, isLoading } = props

  const taggedVlanContent = () => {
    if(data?.taggedVlans){
      const sortedVlans = Array.isArray(data.taggedVlans)
        ? [...data.taggedVlans].sort((a, b) => Number(a) - Number(b)).join(', ')
        : ''

      return (<Tooltip title={sortedVlans} dottedUnderline={true} placement='bottom'>
        {data.taggedVlans ? data.taggedVlans.length : 0}
      </Tooltip>)
    }else{
      return 0
    }
  }
  const macOuiContent = () => {
    if(data?.macOuis){
      return (<Tooltip
        title={data.macOuis?.map(item=> item.oui).join('\n')}
        dottedUnderline={true}
        placement='bottom'
      >
        {data.macOuis ? data.macOuis.length : 0}
      </Tooltip>)
    }else{
      return 0
    }
  }
  const lldpTlvContent = () => {
    if(data?.lldpTlvs){
      return (<Tooltip
        title={data.lldpTlvs?.map(item=> item.systemName).join('\n')}
        dottedUnderline={true}
        placement='bottom'
      >
        {data.lldpTlvs ? data.lldpTlvs.length : 0}
      </Tooltip>)
    }else{
      return 0
    }
  }

  const portProfileData = [
    {
      title: $t({ defaultMessage: 'Untagged VLAN' }),
      content: data?.untaggedVlan
    },
    {
      title: $t({ defaultMessage: 'Tagged VLAN' }),
      content: taggedVlanContent()
    },
    {
      title: $t({ defaultMessage: 'MAC OUI' }),
      content: macOuiContent()
    },
    {
      title: $t({ defaultMessage: 'LLDP TLV' }),
      content: lldpTlvContent()
    },
    {
      title: $t({ defaultMessage: '802.1X Authentication' }),
      content: data?.dot1x ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' }),
      colSpan: 5
    },
    {
      title: $t({ defaultMessage: 'MAC Auth' }),
      content: data?.macAuth ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
    }
  ]

  return(
    <Loader states={[ { isLoading } ]}>
      <GridRow style={{ flexGrow: '1' }}>
        <GridCol col={{ span: 24 }}>
          <SummaryCard data={portProfileData} />
        </GridCol>
      </GridRow>
    </Loader>)
}
