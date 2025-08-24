import { ModelIncludeInput, ModelWhereInput } from "./@types";

export class QueryBuilderService {
    public buildQuery<WhereInput extends ModelWhereInput, IncludeInput extends ModelIncludeInput,
        ModelDto>(queryDto: ModelDto, whereBuilder?: (search: string) => WhereInput) {
        const { page, limit, search, sortBy, order, includes } = queryDto as ModelDto as any;
        // pagination
        const skip = page - 1 * limit;
        const take = limit;

        // where
        let where: WhereInput | undefined;
        if (search && whereBuilder) {
            where = whereBuilder(search)
        }

        // orderBy
        const orderBy = sortBy && order ? {
            [sortBy]: order
        } : undefined

        // include
        const include = includes as IncludeInput;
        return {
            skip,
            take,
            where,
            orderBy,
            include
        }

    }
}
export default new QueryBuilderService()