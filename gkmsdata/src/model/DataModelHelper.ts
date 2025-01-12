import "./DataModelDefinitions"; // Must import this to auto register
import type DataModelObject from "./DataModelObject";
import type { $Nullable, StaticClass } from "../TypeHelpers";
import { $gAllDataModels } from "../annotations/DataModelAnnotations";
import { $gObjectTagToDataModelObject } from "../annotations/ObjectTagRegistry";

class DataModelHelperStatic {
    static get allDataModels(): ReadonlyMap<string, DataModelObject> {
        return $gAllDataModels;
    }

    static getAllDataModels(): readonly DataModelObject[] {
        return [...this.allDataModels.values()];
    }

    static getDataModelByTag(tag: string): $Nullable<DataModelObject> {
        return $gObjectTagToDataModelObject.get(tag) || null;
    }
}

const DataModelHelper = DataModelHelperStatic as StaticClass<typeof DataModelHelperStatic>;
export default DataModelHelper;
