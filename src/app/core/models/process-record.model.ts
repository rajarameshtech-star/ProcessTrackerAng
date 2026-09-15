export interface ProcessRecord {
  id: string;
  serviceItemId: string;
  processDefinitionId: string;
  dataJson: string;
  createdDate?: string;
  modifiedDate?: string;
  createdBy?: string;
  modifiedBy?: string;
}