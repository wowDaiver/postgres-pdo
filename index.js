class Pdo {
    constructor(client, options = {}) {
        this.client = client;
        this._options = options;
        this.escape = options.escapeCb ?? encodeURI;
        this.unescape = options.unescapeCb ?? unescape;
        this.clean();
        this._catch = console.error;
        this._getLogDuration = options.getLogDuration;
    }

    catch(fn) {
        this._catch = fn;
        return this;
    }

    setEscape(escape) {
        this.escape = escape ?? encodeURI;
        return this;
    }

    withClient(client) {
        const pdo = new Pdo(client, this._options);
        pdo._catch = this._catch;
        pdo._getLogDuration = this._getLogDuration;
        pdo.escape = this.escape;
        pdo.unescape = this.unescape;
        return pdo;
    }

    fork(client = this.client) {
        return this.withClient(client);
    }

    async transaction(fn) {
        try {
            return await this.client.begin(async trx => {
                const trxPdo = this.withClient(trx);
                return await fn(trxPdo, trx);
            });
        } catch (e) {
            this._catch(e);
        }
    }

    clean() {
        this._type = null;
        this._table = null;
        this._where = null;
        this._columns = null;
        this._values = null;
        this._groupBy = null;
        this._select = null;
        this._join = [];
        this._orderBy = null;
        this._orderDirection = null;
        this._limit = null;
        this._offset = null;
        this._returning = null;
        this._conflict = null;
        this._having = null;
        this._subQueries = [];
        this._lock = null;
        this._skipLocked = false;
        this._noWait = false;
        this._first = false;
    }

    select(select = ['*']) {
        const query = this.fork();
        query._type = 'select'
        query._select = select;
        return query;
    }

    from(table) {
        this._table = table;
        return this;
    }

    update(pairs = null) {
        const query = this.fork();
        query._type = 'update';
        if (pairs) {
            query.set(pairs);
        }
        return query;
    }

    set(pairs) {
        this._columns = [];
        this._values = [];
        Object.keys(pairs).forEach(key => {
            this._columns.push(key);
            this._values.push(pairs[key]);
        });
        return this;
    }

    table(table) {
        this._table = table;
        return this;
    }

    insert(columns = null) {
        const query = this.fork();
        query._type = 'insert';
        if (columns) {
            if (Array.isArray(columns)) {
                query.columns(columns);
            } else {
                query.columns(Object.keys(columns));
                query.values(Object.values(columns));
            }
        } else {
            query.columns(columns);
        }
        return query;
    }

    returning(id) {
        this._returning = id;
        return this;
    }

    columns(columns) {
        this._columns = columns;
        return this;
    }

    values(values) {
        this._values = values;
        return this;
    }

    into(table) {
        this._table = table;
        return this;
    }

    delete(table) {
        const query = this.fork();
        query._type = 'delete';
        query._table = table;
        return query;
    }

    leftJoin(joinTable, field1, cond, field2, clause, condWhere, value) {
        this._join.push(`LEFT JOIN ${joinTable} ON ${field1} ${cond} ${field2}${clause ? ` AND ${clause} ${condWhere} ${this.escapeData(value)}` : ''}`);
        return this;
    }

    where(clause, cond, value, skipEscape = false) {
        this._where = `${clause} ${cond} ${skipEscape ? value : this.escapeData(value)}`;
        return this;
    }

    whereIsNull(clause) {
        this._where = `${clause} IS NULL`;
        return this;
    }

    whereIsNotNull(clause) {
        this._where = `${clause} IS NOT NULL`;
        return this;
    }

    orWhereIsNull(clause) {
        this._where = `${this._where} OR ${clause} IS NULL`;
        return this;
    }

    orWhereIsNotNull(clause) {
        this._where = `${this._where} OR ${clause} IS NOT NULL`;
        return this;
    }

    andWhereIsNull(clause) {
        this._where = `${this._where} AND ${clause} IS NULL`;
        return this;
    }

    andWhereIsNotNull(clause) {
        this._where = `${this._where} AND ${clause} IS NOT NULL`;
        return this;
    }

    andWhere(clause, cond, value) {
        this._where = `${this._where} AND ${clause} ${cond} ${this.escapeData(value)}`;
        return this;
    }

    orWhere(clause, cond, value) {
        this._where = `${this._where} OR ${clause} ${cond} ${this.escapeData(value)}`;
        return this;
    }

    whereIn(clause, arr) {
        this._where = `${clause} IN (${arr.map(item => this.escapeData(item)).join(',')})`;
        return this;
    }

    andWhereIn(clause, arr) {
        this._where = `${this._where} AND ${clause} IN (${arr.map(item => this.escapeData(item)).join(',')})`;
        return this;
    }

    andWhereNotIn(clause, arr) {
        this._where = `${this._where} AND ${clause} NOT IN (${arr.map(item => this.escapeData(item)).join(',')})`;
        return this;
    }

    andWithBrace() {
        this._where = `${this._where} AND (1 = 1`;
        return this;
    }

    orWithBrace() {
        this._where = `${this._where} OR (1 = 1`;
        return this;
    }

    closeBrace() {
        this._where = `${this._where})`;
        return this;
    }

    conflictDoNothing() {
        this._conflict = `DO NOTHING`;
        return this;
    }

    conflictDoUpdate(clause, pairs) {
        this._conflict = `(${clause}) DO UPDATE SET ${Object.keys(pairs).map(column =>
            (`${column} = ${this.escapeData(pairs[column])}`)).join(',')}`;
        return this;
    }

    groupBy(groupBy) {
        this._groupBy = groupBy;
        return this;
    }

    orderBy(column, direction = 'ASC') {
        this._orderBy = column;
        this._orderDirection = direction;
        return this;
    }

    having(clause, cond, value, skipEscape = false) {
        this._having = `${clause} ${cond} ${skipEscape ? value : this.escapeData(value)}`;
        return this;
    }

    andHaving(clause, cond, value) {
        this._having = `${this._having} AND ${clause} ${cond} ${this.escapeData(value)}`;
        return this;
    }

    orHaving(clause, cond, value) {
        this._having = `${this._having} OR ${clause} ${cond} ${this.escapeData(value)}`;
        return this;
    }

    limit(limit, offset = 0) {
        this._limit = limit;
        this._offset = offset;
        return this;
    }

    with(subQueries) {
        if (Array.isArray(subQueries))
            this._subQueries = [...subQueries];

        if (typeof subQueries === 'string')
            this._subQueries = [subQueries];

        return this;
    }

    forUpdate() {
        this._lock = 'FOR UPDATE';
        return this;
    }

    forShare() {
        this._lock = 'FOR SHARE';
        return this;
    }

    skipLocked() {
        this._skipLocked = true;
        return this;
    }

    noWait() {
        this._noWait = true;
        return this;
    }

    first() {
        this._first = true;
        if (!this._limit) {
            this._limit = 1;
            this._offset = 0;
        }
        return this;
    }

    returningOne(id) {
        return this.returning(id).first();
    }

    escapeData(value) {
        try {
            if (value === null || !this.escape) {
                return value;
            } else if (typeof value === "boolean") {
                return value;
            } else if (typeof value === "string") {
                return `'${this.escape(value)}'`;
            } else if (typeof value === "number") {
                return parseFloat(value);
            } else {
                return `'${this.escape(value)}'`;
            }
        } catch (e) {
            return `'${value}'`;
        }
    }

    join(arr) {
        return arr.reduce((acc, cur) => acc + (acc !== undefined ? ',' : '') + cur);
    }

    getQuery() {
        let query;
        switch (this._type) {
            case 'select':
                query = `SELECT ${this.join(this._select)}
                         FROM ${this._table}`;
                if (this._join.length) {
                    this._join.map(str => {
                        query += ` ${str}`;
                    });
                }
                if (this._where) {
                    query += ` WHERE ${this._where}`;
                }
                if (this._groupBy) {
                    query += ` GROUP BY ${this._groupBy}`;
                }
                if (this._having) {
                    query += ` HAVING ${this._having}`;
                }
                if (this._orderBy) {
                    query += ` ORDER BY ${this._orderBy} ${this._orderDirection}`;
                }
                if (this._limit) {
                    query += ` LIMIT ${this._limit}`;
                }
                if (this._offset) {
                    query += ` OFFSET ${this._offset}`;
                }
                if (this._lock) {
                    query += ` ${this._lock}`;
                }
                if (this._skipLocked) {
                    query += ` SKIP LOCKED`;
                }
                if (this._noWait) {
                    query += ` NOWAIT`;
                }
                if (this._subQueries.length) {
                    query = `WITH ${this._subQueries.join(',')} ${query}`;
                }
                break;
            case 'insert':
                query =
                    `INSERT INTO ${this._table} (${this._columns?.join(',')})
                     VALUES (${this.join(this._values?.map((v) => this.escapeData(v)))})`;
                if (this._conflict) {
                    query += ` ON CONFLICT ${this._conflict}`;
                }
                if (this._returning) {
                    query += ` RETURNING ${this._returning}`;
                }
                if (this._subQueries.length) {
                    query = `WITH ${this._subQueries.join(',')} ${query}`;
                }
                break;
            case 'update':
                query = `UPDATE ${this._table}
                         SET ${this._values?.map((value, i) => {
                             return `${this._columns[i]} = ${this.escapeData(value)}`;
                         }).join(',')}`;
                if (this._conflict) {
                    query += ` ON CONFLICT ${this._conflict}`;
                }
                if (this._where) {
                    query += ` WHERE ${this._where}`;
                }
                if (this._returning) {
                    query += ` RETURNING ${this._returning}`;
                }
                if (this._subQueries.length) {
                    query = `WITH ${this._subQueries.join(',')} ${query}`;
                }
                break;
            case 'delete':
                query = `DELETE
                         FROM ${this._table}`;
                if (this._where) {
                    query += ` WHERE ${this._where}`;
                }
                if (this._returning) {
                    query += ` RETURNING ${this._returning}`;
                }
                if (this._subQueries.length) {
                    query = `WITH ${this._subQueries.join(',')} ${query}`;
                }
                break;
        }
        return query;
    }

    async execute() {
        const startTime = new Date().getTime();
        const query = this.getQuery();
        try {
            const result = await this.client.unsafe(query);
            if (this._getLogDuration) {
                this._getLogDuration(query.replace(/\n/g, ' ').replace(/\s+/g, ' '), new Date().getTime() - startTime);
            }
            if (this._first) {
                return result?.[0];
            }
            return result;
        } catch (e) {
            this._catch(e);
        }
    }
}

module.exports = Pdo;
