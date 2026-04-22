const assert = require('assert');
const Pdo = require('./index');

function createMockClient() {
    return {
        queries: [],
        async unsafe(query) {
            this.queries.push(query);
            return [{ id: 1, uid: 42 }];
        },
        async begin(fn) {
            const trx = {
                queries: [],
                async unsafe(query) {
                    this.queries.push(query);
                    return [{ id: 2, uid: 99 }];
                },
            };
            return await fn(trx);
        },
    };
}

(async () => {
    const client = createMockClient();
    const pdo = new Pdo(client);

    const lockedRow = await pdo
        .fork()
        .select()
        .from('users')
        .where('uid', '=', 42)
        .forUpdate()
        .skipLocked()
        .first()
        .execute();

    assert.deepStrictEqual(lockedRow, { id: 1, uid: 42 });
    assert.strictEqual(
        client.queries[0],
        "SELECT *\n                         FROM users WHERE uid = 42 LIMIT 1 FOR UPDATE SKIP LOCKED"
    );

    const returnedRow = await pdo
        .fork()
        .update({ name: 'Alice' })
        .table('users')
        .where('uid', '=', 42)
        .returningOne(['id', 'uid'])
        .execute();

    assert.deepStrictEqual(returnedRow, { id: 1, uid: 42 });
    assert.strictEqual(
        client.queries[1],
        "UPDATE users\n                         SET name = 'Alice' WHERE uid = 42 RETURNING id,uid"
    );

    const transactionResult = await pdo.transaction(async (trxPdo) => {
        const row = await trxPdo
            .select()
            .from('users')
            .where('uid', '=', 99)
            .forUpdate()
            .noWait()
            .first()
            .execute();

        assert.deepStrictEqual(row, { id: 2, uid: 99 });
        return row.uid;
    });

    assert.strictEqual(transactionResult, 99);

    console.log('postgres-pdo tests passed');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
