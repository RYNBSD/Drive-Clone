import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import type { schema } from "../schema/index.js";
import type { z } from "zod";

type Schema = typeof schema.model;

// type CreateOptionalId = { id: CreationOptional<number> };

type OptionalId<Table, IdType> = "id" extends keyof Table
  ? { id: CreationOptional<IdType> }
  : {};

type ParsedTable<Table> = {
  [K in keyof Table]: Table[K] extends null | undefined
    ? CreationOptional<Table[K]>
    : Table[K];
} & OptionalId<Table, number>;

export type Tables = {
  [K in keyof Schema]: Model<
    InferAttributes<ParsedTable<z.infer<Schema[K]>>>,
    InferCreationAttributes<ParsedTable<z.infer<Schema[K]>>>
  >;
};
