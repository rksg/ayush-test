export interface CreateNetworkFormFields {
  name: string;
  description?: string;
  type: string;
  isCloudpathEnabled?: boolean;
  venues: [];
}

export interface NetworkSaveData {
  name?: string;
  description?: string;
  type?: string;
  enableAccountingProxy?: boolean;
  enableAuthProxy?: boolean;
  cloudpathServerId?: string;
  venues?: [];
  wlan?: object;
}
