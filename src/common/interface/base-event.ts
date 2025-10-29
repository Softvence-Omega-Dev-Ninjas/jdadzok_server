export interface BaseEvent<TMeta> {
    action: "CREATE" | "UPDATE" | "DELETE";
    meta: TMeta;
}
