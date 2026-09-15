export interface ProcessField {
  id: string;
  processDefinitionId: string;
  fieldName: string;
  label: string;
  fieldType: number;
  isRequired: boolean;
  sortOrder: number;
  placeholder?: string;
  defaultValue?: string;
  optionsJson?: string;
  minLength?: number;
  maxLength?: number;
  isActive: boolean;
}