import { ModelIncludeInput, ModelWhereInput } from "./@types";

export class QueryBuilderService {
    public buildQuery<WhereInput extends ModelWhereInput, IncludeInput extends ModelIncludeInput,
        ModelDto>(queryDto: ModelDto, whereBuilder?: (search: string) => WhereInput) {
        const { page, limit, search, sortBy, order, include: includes, orderBy: dtoOrderBy } = queryDto as any;

        const skip = page && limit ? (page - 1) * limit : 0;
        const take = limit ?? undefined;

        let where: WhereInput | undefined;
        if (search && whereBuilder) {
            where = whereBuilder(search);
        }

        const orderBy = sortBy && order
            ? { [sortBy]: order }
            : dtoOrderBy;

        const include = includes as IncludeInput;

        return {
            skip,
            take,
            where,
            orderBy,
            include
        };
    }

}
export default new QueryBuilderService()