import postgres = require("postgres");

interface IPdoOptions {
    escapeCb?: (sqlUnsavedQuery: string) => string;
    unescapeCb?: (sqlUnsavedQuery: string) => string;
}

export class Pdo<T extends { [name: string]: unknown } = any> {
    client: postgres.Sql<T>;
    escape: (sqlUnsavedQuery: string) => string;

    unescape: (sqlUnsavedQuery: string) => string;

    constructor(client: postgres.Sql<T>, options: IPdoOptions)

    catch(fn: (error: any) => void): Pdo<T>;

    setEscape(escape?: (sqlUnsavedQuery: string) => string): Pdo<T>;

    clean() : void

    select(select?: string[]): Pdo<T>

    from(table: string): Pdo<T>


    update(pairs: { [key: string]: any } | null): Pdo<T>

    set(pairs: { [key: string]: any } ): Pdo<T>;

    table(table: string): Pdo<T>;

    insert(columns: { [key: string]: any } | string[] | null): Pdo<T>;

    returning(id: string | string[]): Pdo<T>;

    columns(columns: string[]): Pdo<T>;

    values(values: string[]): Pdo<T>;

    into(table: string): Pdo<T>;

    delete(table: string): Pdo<T>;

    leftJoin(joinTable: string, field1: string, cond: string, field2: string, clause?: string, condWhere?: string, value?: any): Pdo<T>;

    where(clause: string, cond: string, value: string, skipEscape?: boolean): Pdo<T>;

    whereIsNull(clause: string): Pdo<T>;

    whereIsNotNull(clause: string): Pdo<T>;

    orWhereIsNull(clause: string): Pdo<T>;

    orWhereIsNotNull(clause: string): Pdo<T>;

    andWhereIsNull(clause: string): Pdo<T>;

    andWhereIsNotNull(clause: string): Pdo<T>;

    andWhere(clause: string, cond: string, value: string): Pdo<T>;

    orWhere(clause: string, cond: string, value: string): Pdo<T>;

    whereIn(clause: string, arr: string[]): Pdo<T>;

    andWhereIn(clause:string, arr: string[]): Pdo<T>;

    andWhereNotIn(clause: string, arr: string[]): Pdo<T>;

    andWithBrace() : Pdo<T>;

    orWithBrace() : Pdo<T>;

    closeBrace() : Pdo<T>;

    having(clause: string, cond: string, value: string, skipEscape?: boolean): Pdo<T>;

    conflictDoNothing(): Pdo<T>;

    conflictDoUpdate(clause: string, pairs: { [key: string]: any }): Pdo<T>;

    groupBy(groupBy: string): Pdo<T>;

    orderBy(column: string, direction: 'DESC' | 'ASC'): Pdo<T>;

    limit(limit: number, offset?: number): Pdo<T>;

    with(subQueries: string | string[]): Pdo<T>;

    escapeData(value: any): string;
    join(arr: string[]): string;

    getQuery(): string | undefined;

    execute(): Promise<T[]>;
}
