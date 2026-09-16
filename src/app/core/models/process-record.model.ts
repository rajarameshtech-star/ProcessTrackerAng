export interface ProcessRecord {
  id: string | number;
  serviceItemId: string | number;
  processDefinitionId: string | number;
  dataJson: string;
  createdDate?: string;
  modifiedDate?: string;
  createdBy?: string;
  modifiedBy?: string;
}