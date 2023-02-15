import { Tooltip } from '@acx-ui/components';
import { SwitchPortStatus } from '@acx-ui/rc/utils';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import * as UI             from './styledComponents'

export function Port (props:{
  portData: SwitchPortStatus
  portColor: string, 
  portIcon: string,
  labelText: string,
  labelPosition: 'top' | 'bottom',
  tooltipEnable: boolean
}) {
  const { portData, portColor, portIcon, labelText, labelPosition, tooltipEnable } = props
  const getTooltip = (port: SwitchPortStatus) => {
    const speedNoData = 'link down or no traffic';
    const isUnTaggedVlanValid = port.unTaggedVlan !== '' && port.unTaggedVlan !== undefined;
    let UntaggedVlanText;
    let taggedVlanText = '';

    if (isUnTaggedVlanValid) {
      UntaggedVlanText = `<span style="font-family:'ruckus';font-size:14px;">&#xe08f; </span>` + port.unTaggedVlan;
    } else {
      UntaggedVlanText = `<span style="font-family:'ruckus';font-size:14px;">&#xe08f; </span>` + '--';
    }

    if (port.vlanIds !== '' && port.vlanIds !== undefined) {
      let vlanIdsArray = port.vlanIds.split(' ');

      if (isUnTaggedVlanValid) {
        let taggedVlan = '--';
        if (vlanIdsArray.length > 1) {
          vlanIdsArray = _.remove(vlanIdsArray, n => n !== port.unTaggedVlan);
          vlanIdsArray.sort((a, b) => Number(a) - Number(b));
          // CMS-779 PLM feedback: Show up to 15 vlans in tooltip. If more than 15 VLANs, truncate and add an ellipsis
          const ellipsis = (vlanIdsArray.length > 15) ? '...' : '';
          const showVlanIdArray = (vlanIdsArray.length > 15) ? vlanIdsArray.slice(0, 15) : vlanIdsArray;
          taggedVlan = showVlanIdArray.join(', ').concat(ellipsis);
        }

        taggedVlanText = `<span style="font-family:'ruckus';font-size:14px;">  &#xe08e; </span>` + taggedVlan;
      } else {
        taggedVlanText = `<span style="font-family:'ruckus';font-size:14px;">  &#xe08e; </span>` + vlanIdsArray.join(', ');
      }
    }

    const poeUsed = Math.round(port.poeUsed / 1000);
    const poeTotal = Math.round(port.poeTotal / 1000);

    const tooltipText =
      `<span class="label d-inline-block">Port: </span>` +
      `<span class="value d-inline-block">${port.portIdentifier}</span><br/>` +
      `<div class="d-flex">` +
      `<span class="label d-inline-block">Name: </span>` +
      `<span class="value d-inline-block">${port.name === '' ? '--' : port.name}</span></div>` +
      `<div class="d-flex">` +
      `<div class="label d-inline-block">VLAN: </div>` +
      `<span class="value d-inline-block">` +
      `${UntaggedVlanText === '' ? '--' : UntaggedVlanText}<br/>` +
      `${taggedVlanText === '' ? '--' : taggedVlanText}</span></div>` +
      `<span class="label mb-1 d-inline-block">Port Speed: </span>` +
      `<span class="value d-inline-block">${port.portSpeed === speedNoData ? '--' : port.portSpeed}</span><br/>` +
      `<span class="label mb-1 d-inline-block">Port State: </span>` +
      `<span class="value d-inline-block">${port.status}</span><br/>` +
      `<div class="d-flex">` +
      `<span class="label d-inline-block">Connected Device: </span>` +
      `<span class="value d-inline-block">${port.neighborName || port.neighborMacAddress || '--'}</span></div>` +
      `<span class="label mb-1 d-inline-block">PoE Usage: </span>` +
      `<span class="value d-inline-block">${poeUsed} W/ ${poeTotal} W</span><br/>` +
      `<span class="label mb d-inline-block">(Consumed/Allocated)</span><br/>` +
      `<span class="label mb-1 d-inline-block">PoE Device Type: </span>` +
      `<span class="value d-inline-block">${port.poeType === '' ? '--' : port.poeType}</span><br/>`;

    return <FormattedMessage 
    defaultMessage={`<span>Port: </span>
    <span>{portIdentifier}</span><br/>
    <div>
    <span>Name: </span>
    <span>{portName}</span></div>
    <div>
    <div>VLAN: </div>
    <span>
    {UntaggedVlanText}<br/>
    {taggedVlanText}</span></div>
    <span>Port Speed: </span>
    <span>{portSpeed}</span><br/>
    <span>Port State: </span>
    <span>{portStatus}</span><br/>
    <div>
    <span>Connected Device: </span>
    <span>{connectedDevice}</span></div>
    <span>PoE Usage: </span>
    <span>{poeUsed} W/ {poeTotal} W</span><br/>
    <span>(Consumed/Allocated)</span><br/>
    <span>PoE Device Type: </span>
    <span>{portPoeType}</span><br/>`}
    values={{
      portIdentifier: port.portIdentifier,
      portName: port.name === '' ? '--' : port.name,
      portSpeed: port.portSpeed === speedNoData ? '--' : port.portSpeed,
      portStatus: port.status,
      connectedDevice: port.neighborName || port.neighborMacAddress || '--',
      portPoeType: port.poeType === '' ? '--' : port.poeType,
      UntaggedVlanText: UntaggedVlanText === '' ? '--' : UntaggedVlanText,
      taggedVlanText: taggedVlanText === '' ? '--' : taggedVlanText,
      poeUsed: poeUsed,
      poeTotal: poeTotal,
      span: (contents) => <span>{contents}</span>,
      div: (contents) => <div>{contents}</div>,
      br: () => <br />
    }}/>
  }
  
  const portElement = <UI.PortWrapper>
    { labelPosition === 'top' && <UI.PortLabel>{labelText}</UI.PortLabel> }
    <UI.Port portColor={portColor}>
      { portIcon ==='UpLink' && <UI.UplinkPortIcon/> }
      { portIcon ==='Stack' && <UI.StackingPortIcon/> }
      { portIcon ==='PoeUsed' && <UI.PoeUsageIcon /> }
    </UI.Port>
    { labelPosition === 'bottom' && <UI.PortLabel>{labelText}</UI.PortLabel> }
  </UI.PortWrapper>
  
  return tooltipEnable 
  ? <Tooltip
    placement={'top'}
    title={getTooltip(portData)}>
    {portElement}
  </Tooltip>
  : portElement
}