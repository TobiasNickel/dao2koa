
import * as Koa from 'koa';
import * as route from 'koa-route';

/**
 * 
 * 
 * @param {any} input
 * @returns
 */
var defaultFilter = async function (input) { return input; };

const m = module.exports;
/**
 * 
 * 
 * @param {any} dao
 * @param {any} options
 * @returns
 */
m.daoToRestRouter = function (dao, options) {
    var router = new Koa();

    const inputFilter = options.inputFilter || defaultFilter;
    const outputFilter = options.outputFilter || defaultFilter;
    const maxPageSize = parseInt(options.maxPageSize) || 10;
    const defaultPageSize = options.pageSize || 10;
    const searchableFields = options.searchableFields || ['id'];
    const fulltextFields = options.fillTextFields || searchableFields;
    const fetchableFields = options.fetchableFields || [];
    const allowChangesOnGet = (options.allowChangesOnGet !== undefined) ? !!options.changeOnGet : true;
    const defaultOrder = options.defaultOrder || undefined;
    
    const _escapeName = function(str){
        return dao.db.pool.escape(str).substr(1,str.length);
    };
    
    /**
     * 
     * 
     * @param {any} ctx
     */
    const createHandler = async function (ctx) {
        const newItem = defaults(defaults({}, ctx.query), ctx.req.body);
        const validatedItem = await inputFilter(ctx, newItem);
        if (validatedItem) {
            const id = await dao.insert(validatedItem,ctx.connection);
            const item = await dao.getOneById(id,ctx.connection);
            ctx.body = await outputFilter(ctx, item,ctx.connection);
        } else {
            ctx.body = false;
        }
    };

    /**
     * 
     * 
     * @param {any} ctx
     * @param {any} id
     * @returns
     */
    const deleteHandler = async function (ctx, id) {
        const item = await dao.getOneById(id,ctx.connection);
        if (!item) {
            ctx.body = true;
            return;
        }
        const shouldDelete = await inputFilter(ctx, undefined, item);
        if (shouldDelete) {
            await dao.remove(id,ctx.connection);
        }
        ctx.body = true;
    };

    /**
     * 
     * 
     * @param {any} ctx
     * @param {String} id
     */
    const getByIdHandler = async function (ctx, id) {
        const item = await dao.getOneById(id,ctx.connection);
        if (item) {
            ctx.body = await outputFilter(ctx, item);
        } else {
            ctx.body = false;
        }

        if (ctx.query && ctx.query._fetch) {
            await _fetch(item, ctx.query._fetch,ctx.connection);
        }
    };

    const updateHandler = async function (ctx, id) {
        const updates = defaults(defaults({ id: id }, ctx.query), ctx.req.body);
        var item = await dao.getOneById(id,ctx.connection);
        if (!item) {
            ctx.body = false;
            return;
        }
        const updateSet = await inputFilter(ctx, updates, item);
        if (!updateSet) {
            ctx.body = false;
            return;
        }
        const keys = Object.keys(updateSet);
        if (keys.length > 1) {
            await dao.saveOne(updateSet,ctx.connection);
        }
        ctx.body = true;
    };

    const searchHandler = async function (ctx) {
        const query = ctx.query;
        const keys = Object.keys(query);
        const params = {};
        var queryProps = [];
        keys.forEach(function (key) {
            if (key[0] === '_') {
                params[key] = query[key];
            } else {
                queryProps.push(key);

            }
        });
        var pageSize = parseInt(params._pageSize) || defaultPageSize;
        if (pageSize > maxPageSize) {
            pageSize = maxPageSize;
        }
        var page = parseInt(params._page) || 0;
        var items = [];

        var order = defaultOrder;
        if(query._order){
            if(query._direction && query._direction.toLowerCase().trim() === 'desc'){
                order = _escapeName(query._order) + ' desc';
            }else{
                order = _escapeName(query._order) + ' asc';
            }
        }

        if (!queryProps.length) {
            //get all
            items = await dao.getAll(order, page, pageSize,ctx.connection);
        } else {
            if (queryProps.length === 1 && queryProps[0] === 'q') {
                // todo: fulltext
                const searchString = '%' + query.q + '%';
                const where = [];
                const params = [];
                fulltextFields.forEach(function (propName) {
                    where.push(propName + ' LIKE ? ');
                    params.push(searchString);
                });
                items = await dao.where(where.join(' OR '), params, order, page, pageSize,ctx.connection);
            } else {
                //property filter
                queryProps = intersection(queryProps, searchableFields);
                if (queryProps.length) {
                    const where = [];
                    const params = [];
                    queryProps.forEach(function (propName) {
                        const value = query[propName];
                        const indicator = value[0];
                        if (indicator === '>') {
                            where.push(propName + ' > ?');
                            params.push(value.substr(1));
                        } else if (indicator === '<') {
                            where.push(propName + ' < ?');
                            params.push(value.substr(1));
                        } else if (indicator === '!') {
                            where.push(propName + ' <> ?');
                            params.push(value.substr(1));
                        } else {
                            where.push(propName + ' = ?');
                            params.push(value);
                        }
                    });
                    //items = await dao.findWhere(queryPropValues, page, pageSize);
                    items = await dao.where(where.join(' AND '), params, page, pageSize,ctx.connection);
                } else {
                    ctx.body = { message: 'no allowed parameter' };
                    return;
                }
            }
        }

        const output = [];
        for (var item of items) {
            let out = await outputFilter(ctx, item);
            if (out) output.push(out);
        }
        if (query._fetch) {
            await _fetch(output, query._fetch, ctx.connection);
        }
        ctx.body = {
            items: output,
            count: output.length,
            resultCount: items.resultCount,
            pageCount: items.pageCount
        };
    };

    const _fetch = async function (items, extendNames,connection) {
        const wantedFields = extendNames.split(',');
        const fetchNames = intersection(wantedFields, fetchableFields);

        for (var name of fetchNames) {
            await dao['fetch' + capitalize(name)](items,connection);
        }
        return items;
    };

    if (allowChangesOnGet) {
        router.use(route.get('/create', createHandler));
        router.use(route.get('/delete/:id', deleteHandler));
        router.use(route.get('/update/:id', updateHandler));
    }
    router.use(route.post('/', createHandler));
    router.use(route.delete('/:id', deleteHandler));
    router.use(route.put('/:id', updateHandler));
    router.use(route.get('/:id', getByIdHandler));
    router.use(route.get('/', searchHandler));

    return router;
};

m.transactionMiddleware = function (db) {
    return async function (ctx, next) {
        var connection = await db.beginTransaction();
        try {
            ctx.connection = connection;
            //await db.save({id:'1',obj:'data'}, connection);
            await next();
            await connection.commit();
        } catch (e) {
            await connection.rollback();
        }
    };
};

function capitalize(s) {
    return s[0].toUpperCase() + s.substr(1);
}

function intersection(arrayA,arrayB) {
    var result = [];
    arrayA.forEach(function(item){
        if((arrayB.indexOf(item)!==-1) && result.indexOf(item)===-1){
            result.push(item);
        }
    });
    return result;
};

function defaults(object,defaults){
    var keys = Object.keys(defaults);
    keys.forEach(function(key){
        if(typeof object[key] === 'undefined'){
            object[key] = defaults[key];
        }
    });
}
