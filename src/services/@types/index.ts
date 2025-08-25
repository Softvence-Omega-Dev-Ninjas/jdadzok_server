import { Prisma } from "@prisma/client";

export type ModelWhereInput = {
  [key: string]: any;
};
export type ModelIncludeInput = {
  [key: string]: boolean | object;
};

/** Define a generic type for the combined query options */
export type QueryOptions<
  WhereInput extends ModelWhereInput,
  IncludeInput extends ModelIncludeInput,
> = {
  where?: WhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.SortOrder | Prisma.Enumerable<Prisma.SortOrder>;
  include: IncludeInput;
};
