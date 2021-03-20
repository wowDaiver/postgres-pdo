class Pdo {
    constructor(client) {
        this.client = client;

        this._type = null;
        this._table = null;
        this._where = null;
    }

    select() {
        this._type = 'select';

        return this;
    }

    from(table) {
        this._table = table;

        return this;
    }

    where(clause, cond, value) {
        this._where = `${clause} ${cond} ${this.escape(value)}`;

        return this;
    }

    andWhere(clause, cond, value) {
        this._where = `${this._where} AND ${clause} ${cond} ${this.escape(value)}`;

        return this;
    }

    orWhere(clause, cond, value) {
        this._where = `${this._where} OR ${clause} ${cond} ${this.escape(value)}`;

        return this;
    }

    whereIn(clause, arr) {
        this._where = `${clause} IN (${arr.map(this.escape).join(',')})`;

        return this;
    }

    escape(value) {
        if (value.toString().replace(/(\d|\.)/g, '').length === 0) {
            return parseFloat(value);
        } else {
            return `'${escape(value)}'`;
        }
    }

    execute() {
        switch (this._type) {
            case 'select':
                let query = `SELECT * FROM ${this._table}`;
                if (this._where) {
                    query += ` WHERE ${this._where}`;
                }
                return this.client.unsafe(query);
        }
    }
}

module.exports = Pdo;
