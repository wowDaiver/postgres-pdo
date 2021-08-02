class Pdo {
    constructor(client, options = {}) {
        this.client = client;
        this.escape = options.escapeCb ?? encodeURI;
        this.unescape = options.unescapeCb ?? unescape;
        this.clean();
    }

    clean() {
        this._type = null;
        this._table = null;
        this._where = null;
        this._columns = null;
        this._values = null;
        this._groupBy = null;
        this._select = null;
        this._join = null;
        this._orderBy = null;
        this._orderDirection = null;
        this._limit = null;
        this._offset = null;
    }

    select(select = ['*']) {
        this.clean();
        this._type = 'select'
        this._select = select;
        return this;
    }

    from(table) {
        this._table = table;
        return this;
    }

    update(pairs = null) {
        this.clean();
        this._type = 'update';
        if (pairs) {
            this.set(pairs);
        }
        return this;
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
        this.clean();
        this._type = 'insert';
        if (columns) {
            if (Array.isArray(columns)) {
                this.columns(columns);
            } else {
                this.columns(Object.keys(columns));
                this.values(Object.values(columns));
            }
        } else {
            this.columns(columns);
        }
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
        this.clean();
        this._type = 'delete';
        this._table = table;
        return this;
    }

    leftJoin(joinTable, field1, cond, field2) {
        this._join = `LEFT JOIN ${joinTable} ON ${field1} ${cond} ${field2}`;
        return this;
    }

    where(clause, cond, value) {
        this._where = `${clause} ${cond} ${this.escapeData(value)}`;
        return this;
    }

    whereIsNull(clause) {
        this._where = `${clause} IS NULL`;
        return this;
    }

    orWhereIsNull(clause) {
        this._where = `OR ${clause} IS NULL`;
        return this;
    }

    andWhereIsNull(clause) {
        this._where = `AND ${clause} IS NULL`;
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
        this._where = `${this._where} AND ${clause} IN (${arr.map(this.escapeData).join(',')})`;
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

    limit(limit, offset = 0) {
        this._limit = limit;
        this._offset = offset;
        return this;
    }

    escapeData(value) {
        try {
            if (value === null) {
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

    getQuery() {
        let query;
        switch (this._type) {
            case 'select':
                query = `SELECT ${this._select?.join(',')}
                         FROM ${this._table}`;
                if (this._join) {
                    query += ` ${this._join}`;
                }
                if (this._where) {
                    query += ` WHERE ${this._where}`;
                }
                if (this._groupBy) {
                    query += ` GROUP BY ${this._groupBy}`;
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
                break;
            case 'insert':
                query =
                    `INSERT INTO ${this._table} (${this._columns?.join(',')})
                     VALUES (${this._values?.map((v) => this.escapeData(v)).join(',')})`;
                break;
            case 'update':
                query = `UPDATE ${this._table}
                         SET ${this._values?.map((value, i) => {
                             return `${this._columns[i]} = ${this.escapeData(value)}`;
                         }).join(',')}`;
                if (this._where) {
                    query += ` WHERE ${this._where}`;
                }
                break;
            case 'delete':
                query = `DELETE
                         FROM ${this._table}`;
                if (this._where) {
                    query += ` WHERE ${this._where}`;
                }
                break;
        }
        return query;
    }

    execute() {
        const query = this.getQuery();
        try {
            return this.client.unsafe(query);
        } catch (e) {
            throw {
                error: e,
                query,
            }
        }
    }
}

module.exports = Pdo;
