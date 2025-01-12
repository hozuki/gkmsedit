# gkmsdata

Type-safe (de-)serialization of [gakumas](https://project-imas.wiki/Gakuen_iDOLM@STER) scenario data in TypeScript.
Just define your entity class with decorators, and pass it to the (de-)serializer.

Developed in around June 2024 for another private project but that one is discontinued.

Note: I'm not a fan of gakumas right now so no update is planned.

## Development

- `npm run dev`
- `npm run test`
- `npm run dist`

Module formats:

- Development build and testing: files are in CommonJS module format.
- Distribution build: files are in ECMAScript module format (for gkmsedit to bundle).

For quick start, look into files:

- `DataModelDefinitions.ts`
- `DataModels.ts`
- `WellKnownObjectTags.ts`

Main usages:

- `ScenarioLineSerializer`
- types exported in `DataModels.ts`

# Quick Start

Define entity:

```typescript
@objectTag(WellKnownObjectTags.Crowd) // "crowd"
@dataClass()
export class CCrowd {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static model: string = undefined!;
    @dataField({ type: FieldType.string })
    static layout: string = undefined!;
}

@objectTag(WellKnownObjectTags.CrowdGroup) // "crowdgroup"
@dataClass({ objectType: ObjectType.plain })
export class CCrowdGroup {
    @dataField({ type: FieldType.array, typeRef: CCrowd, itemsObjectTypeHint: ObjectType.plain })
    static crowds: DataContract<typeof CCrowd>[] = undefined!;
}
```

Export data contract:

```typescript
export type Crowd = DataContract<typeof CCrowd>;
export type CrowdGroup = DataContract<typeof CCrowdGroup>;
```

Register type mapping from top-level object tag to data contract:

```typescript
export default interface WellKnownObjectTagToDataModelObject extends Record<WellKnownObjectTags, object> {
    // ...
    [WellKnownObjectTags.CrowdGroup]: CrowdGroup;
    // ...
}
```

Deserialization:

```typescript
const allDataModels = DataModelHelper.getAllDataModels();
const transformer = TransformerFactory.notationToEntity(allDataModels);
const line = "[crowdgroup crowds=[crowd id=id1 model=model1 layout=layout1]]";
const parsed = GkmsScenarioParserUtils.parseLine(line);

const entity = transformer.transform(parsed, WellKnownObjectTags.CrowdGroup);

assert.strictEqual(entity.crowds[0].model, "layout1");
```

Serialization:

```typescript
const entity: CrowdGroup = {
    crowds: [
        {
            id: "id1",
            model: "model1",
            layout: "layout1",
        },
    ],
};

const objTag = WellKnownObjectTags.CrowdGroup;

const line = ScenarioLineSerializer.serialize({ object: entity, objectTag: objTag });
const expectedLine = "[crowdgroup crowds=[crowd id=id1 model=model1 layout=layout1]]";

assert.strictEqual(line, expectedLine);
```

Features supported:

- Nested objects
  - Nested plain objects (as shown above)
  - JSON-like objects nested in plain objects (appearing in gakumas raw data)
- Data types: string (quoted or raw), enum, int, float, boolean, empty (null)
- Containers: array
- Optional fields
- Spaces handling (presented by `\u00a0` NBSP in gakumas raw data)
