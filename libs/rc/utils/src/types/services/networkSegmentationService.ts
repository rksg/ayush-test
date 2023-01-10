

export interface CreateNetworkSegmentationFormFields {
  name: string
}

export interface NetworkSegmentationSaveData extends CreateNetworkSegmentationFormFields{
  id?: string;
}

export interface NetworkSegmentationGroup {
  id: string,
  name: string
}
