// Visit https://peggyjs.org/online.html to try!

{{
const ValueType = {
    unknown: 0,
    quotedString: 1,
    literalString: 2,
    float: 3,
    integer: 4,
    bool: 5,
    empty: 6,
    array: 7,
    plainObject: 8,
    nestedObject: 9,
};
}}

Start = PlainObjectValue

WS = ' '+

// Note: the string expressions don't handle escape sequences correctly. TODO: fix this
QuotedStringValue = '"' value:$[^"]* '"' { return { type: ValueType.quotedString, value }; }
LiteralStringValue = [^ \[\]=:,]+ { return { type: ValueType.literalString, value: text() }; }

FloatValue = $([+\-]? [0-9]+ ('.' [0-9]*)? ('e' [+\-]? [0-9]+)?) { return { type: ValueType.float, value: Number.parseFloat(text()) }; }
IntegerValue = ([+\-]? [0-9]+) { return { type: ValueType.integer, value: Number.parseInt(text(), 10) }; }
BooleanValue = ('true' / 'false') { const t = text(); return { type: ValueType.bool, value: t === 'true' ? true : false }; }
Empty = '' { return { type: ValueType.empty, value: null }; }

ArrayValue = '[' items:(i0:Value rest:(',' Value)* { const restItems = rest.map(v => v[1]); return [i0, ...restItems]; })? ']' { return { type: ValueType.array, value: items ?? [] }; }
PropertyKey = QuotedStringValue
            / LiteralStringValue
Value = QuotedStringValue
      / FloatValue
      / IntegerValue
      / BooleanValue
      / ArrayValue
      / NestedObjectValue
      / PlainObjectValue
      / LiteralStringValue
PropertyValue = Value / Empty
ObjectTag = [A-Za-z0-9_\-]+ { return text(); }
NamespaceTag = id:$[A-Za-z0-9_\-]+ '::' { return { id }; }

PlainProperty = key:PropertyKey '=' value:PropertyValue { return { key, value }; }
PlainProperties = p0:PlainProperty ps:(WS PlainProperty)* { const restProps = ps ? ps.map(v => v[1]) : []; return [p0, ...restProps]; }
NestedProperty = key:PropertyKey ':' value:PropertyValue { return { key, value }; }
NestedProperties = p0:NestedProperty ps:(',' NestedProperty)* { const restProps = ps ? ps.map(v => v[1]) : []; return [p0, ...restProps]; }

NestedObject = '\\{' properties:NestedProperties '\\}' { return { properties }; }
NestedObjectValue = namespaceTag:NamespaceTag? object:NestedObject { return { type: ValueType.nestedObject, value: { namespaceTag, properties: object.properties }}; }
PlainObject = '[' objectTag:ObjectTag properties:(' ' properties:PlainProperties { return properties; })? ']' { return { objectTag, properties: properties ?? [] }; }
PlainObjectValue = object:PlainObject { return { type: ValueType.plainObject, value: object }; }
