export interface Node {
    type?: DeviceTypes;
    name: string;
    category: number | string;
    id?: string;
    mac?: string;
    serial?: string;
    serialNumber?: string;
    states?: DeviceStates,
    childCount?: number;
    symbol?: string;
    symbolOffset?: Array<number>;
	status?: DeviceStatus;
	label?: string;
	cloudPort?: string;
	isConnectedCloud?: boolean;
	ipAddress?: string;
}

export interface UINode {
	id: string,
    label?: string,
    config: Node,
    depth?: number,
    expanded?: boolean,
	x?: number,
	y?: number
}
export interface Link {
	id?: string;
    source: string;
    target: string;
	from: string;
	fromName?: string;
    to: string;
	toName?: string;
    connectionType?: string;
    connectionStatus?: ConnectionStatus; // this needs to be enum
    connectionStates?: ConnectionStates; // this needs to be enum
    poeEnabled?: boolean;
    linkSpeed?: string;
    poeUsed?: number;
    poeTotal?: number;
    connectedPort?: string;
    correspondingPort?: string;
	angle?: number;
	connectedPortTaggedVlan?: string;
	connectedPortUntaggedVlan?: string;
	correspondingPortTaggedVlan?: string;
	correspondingPortUntaggedVlan?: string;
	fromMac?: string;
	toMac?: string;
	fromSerial?: string;
	toSerial?: string;
}
export interface GraphData {
    type: string;
    categories: Array<Object>;
    nodes: Array<Node>;
    edges: Array<Link>;
}

export interface TopologyData {
	nodes: Array<Node>;
    edges: Array<Link>;
}

export enum ConnectionStatus {
	Good='Good',
	Disconnected='Disconnected',
    Degraded='Degraded',
    Unknown='Unknown'
}

export enum DeviceStatus {
    Initializing='Initializing',
	Operational='Operational',
	Disconnected='Disconnected',
	Degraded='Degraded',
    Unknown='Unknown'
}

export enum DeviceStates {
	Regular='Regular',
	Hover='Hover',
}

export enum ConnectionStates {
	Regular='Regular',
	Hover='Hover',
}

export enum DeviceTypes {
	Switch='Switch',
	SwitchStack='SwitchStack',
	Ap='Ap',
	ApWired='ApWired',
	ApMeshRoot='ApMeshRoot',
	ApMesh='ApMesh',
	Unknown='Unknown',
	Cloud='Cloud'
}