import { useIntl } from 'react-intl'

import { Subtitle, Tooltip }                  from '@acx-ui/components'
import { SwitchPortStatus, SwitchStatusEnum } from '@acx-ui/rc/utils'

import { FrontViewPort } from './FrontViewPort'
import * as UI           from './styledComponents'

export function FrontViewTooltip () {
  const { $t } = useIntl()
  const editablePort = {
    portIdentifier: '1/1/1',
    portnumber: 1,
    deviceStatus: SwitchStatusEnum.OPERATIONAL,
    syncedSwitchConfig: true
  } as unknown as SwitchPortStatus

  const uneditablePort = {
    ...editablePort,
    syncedSwitchConfig: false
  }

  return <Tooltip.Question
    overlayStyle={{ maxWidth: '400px' }}
    title={
      <UI.FrontViewTooltip>
        <div className='title-left'>
          <Subtitle level={5}>
            { $t({ defaultMessage: 'Port States' }) }
          </Subtitle>
        </div>
        <div className='title-right'>
          <Subtitle level={5}>
            { $t({ defaultMessage: 'Icon States' }) }
          </Subtitle>
        </div>
        <div className='ports'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='green'
            portIcon=''
            tooltipEnable={false}
            portData={uneditablePort}
          />
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='green'
            portIcon=''
            tooltipEnable={false}
            portData={editablePort}
          />
        </div>
        <div className='ports-description'>
          { $t({ defaultMessage: 'Up' }) }
        </div>
        <div className='ports'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='green'
            portIcon=''
            tooltipEnable={false}
            portData={editablePort}
          />
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='gray'
            portIcon=''
            tooltipEnable={false}
            portData={editablePort}
          />
        </div>
        <div className='ports-description'>
          { $t({ defaultMessage: 'Port' }) }
        </div>
        <div className='ports'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='gray'
            portIcon=''
            tooltipEnable={false}
            portData={{
              ...editablePort,
              syncedSwitchConfig: false
            }}
          />
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='gray'
            portIcon=''
            tooltipEnable={false}
            portData={editablePort}
          />
        </div>
        <div className='ports-description'>
          { $t({ defaultMessage: 'Down' }) }
        </div>
        <div className='ports poe-icon'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='green'
            portIcon='PoeUsed'
            tooltipEnable={false}
            portData={editablePort}
          />
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='gray'
            portIcon='PoeUsed'
            tooltipEnable={false}
            portData={editablePort}
          />
        </div>
        <div className='ports-description'>
          { $t({ defaultMessage: 'PoE' }) }
        </div>
        <div className='ports'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='lightgray'
            portIcon=''
            tooltipEnable={false}
            portData={{
              ...editablePort,
              deviceStatus: SwitchStatusEnum.DISCONNECTED
            }}
          />
        </div>
        <div className='ports-description' >
          { $t({ defaultMessage: 'Switch is not operational' }) }
        </div>
        <div className='ports'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='green'
            portIcon='UpLink'
            tooltipEnable={false}
            portData={editablePort}
          />
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='gray'
            portIcon='UpLink'
            tooltipEnable={false}
            portData={editablePort}
          />
        </div>
        <div className='ports-description'>
          { $t({ defaultMessage: 'Uplink' }) }
        </div>
        <div className='ports right'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='green'
            portIcon='Breakout'
            tooltipEnable={false}
            portData={editablePort}
          />
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='gray'
            portIcon='Breakout'
            tooltipEnable={false}
            portData={editablePort}
          />
        </div>
        <div className='ports-description right'>
          { $t({ defaultMessage: 'Breakout Port' }) }
        </div>
        <div className='ports right'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='green'
            portIcon='LagMember'
            tooltipEnable={false}
            portData={editablePort}
          />
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='gray'
            portIcon='LagMember'
            tooltipEnable={false}
            portData={editablePort}
          />
        </div>
        <div className='ports-description right'>
          { $t({ defaultMessage: 'LAG Member' }) }
        </div>
        <div className='ports right'>
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='green'
            portIcon='Stack'
            tooltipEnable={false}
            portData={uneditablePort}
          />
          <FrontViewPort
            labelText={''}
            labelPosition='top'
            portColor='gray'
            portIcon='Stack'
            tooltipEnable={false}
            portData={uneditablePort}
          />
        </div>
        <div className='ports-description right'>
          { $t({ defaultMessage: 'Stack Port' }) }
        </div>
      </UI.FrontViewTooltip>
    }
    placement='topRight'
  />
}
