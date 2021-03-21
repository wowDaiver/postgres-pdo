# Postgres Data Object

Pdo wrapper for https://github.com/porsager/postgres

##### Usage

###### Install

```aidl
$ npm i -S postgres-pdo
```

###### Connect

```aidl
const postgres = require('postgres');
const Pdo = require('postgres-pdo');

const options = {
    // Connection parameters
}

const sql = postgres(options);
const pdo = new Pdo(sql);
```

###### Select

```aidl
const result = await pdo
    .select()
    .from('table_name')
    .whereIn('id', [1, 2])
    .orWhere('id', '=', 3)
    .execute();

console.log(result);
```

###### Insert

```aidl
await pdo
    .insert(['name', 'age'])
    .into('table_name')
    .values(['John', 30])
    .execute();
```

###### Update

```aidl
await pdo
    .update({
        name: 'John',
        age: 30
    })
    .table('table_name')
    .where('id', '=', 1)
    .execute();
```

###### Delete

```aidl
await pdo
    .delete('table_name')
    .where('id', '>', 1)
    .execute();
```
