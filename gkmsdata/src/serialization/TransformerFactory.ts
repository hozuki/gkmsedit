import type DataModelObject from "../model/DataModelObject";
import { NotationToEntityTransformer } from "./transformers/NotationToEntity";
import type { StaticClass } from "../TypeHelpers";
import { EntityToNotationTransformer } from "./transformers/EntityToNotation";

class TransformerFactoryStatic {
    static notationToEntity(dataModels: readonly DataModelObject[]): NotationToEntityTransformer {
        return new NotationToEntityTransformer(dataModels);
    }

    static entityToNotation(dataModels: readonly DataModelObject[]): EntityToNotationTransformer {
        return new EntityToNotationTransformer(dataModels);
    }
}

const TransformerFactory = TransformerFactoryStatic as StaticClass<typeof TransformerFactoryStatic>;
export default TransformerFactory;
