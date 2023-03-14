import { ApDeviceStatusEnum, APExtended } from '@acx-ui/rc/utils';
import { APStatus } from '.';
import { Button } from '@acx-ui/components';
export const deviceStatusGroupableOptions = {
  key: 'deviceStatus',
  label: 'Status',
  parentColumns: [
    {
      key: 'deviceStatus',
      renderer: (record: APExtended) => (
        <APStatus status={record.deviceStatus as ApDeviceStatusEnum} />
      ),
    },
    {
      key: 'members',
      renderer: (record: APExtended) => <div>Members: {record.members}</div>,
    },
    {
      key: 'incidents',
      renderer: (record: APExtended) => <div>Incidents (24 hours): {record.incidents}</div>,
    },
    {
      key: 'clients',
      renderer: (record: APExtended) => <div>Connected Clients: {record.clients}</div>,
    },
    {
      key: 'networks',
      renderer: (record: APExtended) => (
        <div>Wireless Networks: {record.networks ? record.networks.count : 0}</div>
      ),
    },
  ],
};
export const modelGroupableOptions = {
  key: 'model',
  label: 'Model',
  parentColumns: [
    {
      key: 'model',
      renderer: (record: APExtended) => <div style={{ fontStyle: 'bold' }}>{record.model}</div>,
    },
    {
      key: 'members',
      renderer: (record: APExtended) => <div>Members: {record.members}</div>,
    },
    {
      key: 'incidents',
      renderer: (record: APExtended) => <div>Incidents (24 hours): {record.incidents}</div>,
    },
    {
      key: 'clients',
      renderer: (record: APExtended) => <div>Connected Clients: {record.clients}</div>,
    },
    {
      key: 'networks',
      renderer: (record: APExtended) => (
        <div>Wireless Networks: {record.networks ? record.networks.count : 0}</div>
      ),
    },
  ],
};
export const deviceGroupNameGroupableOptions = {
  key: 'deviceGroupName',
  label: 'AP Group',
  actions: [
    {
      key: 'edit',
      label: (record: APExtended) => (
        <Button
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log(record);
          }}>
          Edit
        </Button>
      ),
    },
  ],
  parentColumns: [
    {
      key: 'AP Group',
      renderer: (record: APExtended) => (
        <div style={{ fontStyle: 'bold' }}>{record.deviceGroupName}</div>
      ),
    },
    {
      key: 'members',
      renderer: (record: APExtended) => <div>Members: {record.members}</div>,
    },
    {
      key: 'incidents',
      renderer: (record: APExtended) => <div>Incidents (24 hours): {record.incidents}</div>,
    },
    {
      key: 'clients',
      renderer: (record: APExtended) => <div>Connected Clients: {record.clients}</div>,
    },
    {
      key: 'networks',
      renderer: (record: APExtended) => (
        <div>Wireless Networks: {record.networks ? record.networks.count : 0}</div>
      ),
    },
  ],
};
