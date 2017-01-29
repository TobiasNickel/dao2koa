"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Koa = require("koa");
var route = require("koa-route");
/**
 *
 *
 * @param {any} input
 * @returns
 */
var defaultFilter = function (input) {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, input];
    }); });
};
var m = module.exports;
/**
 *
 *
 * @param {any} dao
 * @param {any} options
 * @returns
 */
m.daoToRestRouter = function (dao, options) {
    var router = new Koa();
    var inputFilter = options.inputFilter || defaultFilter;
    var outputFilter = options.outputFilter || defaultFilter;
    var maxPageSize = parseInt(options.maxPageSize) || 10;
    var defaultPageSize = parseInt(options.pageSize || 10);
    var searchableFields = options.searchableFields || ['id'];
    var fulltextFields = options.fillTextFields || searchableFields;
    var fetchableFields = options.fetchableFields || getFetchableFields(getFetchableFields);
    var allowChangesOnGet = (options.allowChangesOnGet !== undefined) ? !!options.changeOnGet : true;
    var defaultOrder = options.defaultOrder || undefined;
    var _escapeName = function (str) {
        return dao.db.pool.escape(str).substr(1, str.length);
    };
    /**
     *
     *
     * @param {any} ctx
     */
    var createHandler = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var newItem, validatedItem, id, item, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        newItem = defaults(defaults({}, ctx.query), ctx.req.body);
                        return [4 /*yield*/, inputFilter(ctx, newItem)];
                    case 1:
                        validatedItem = _b.sent();
                        if (!validatedItem) return [3 /*break*/, 5];
                        return [4 /*yield*/, dao.insert(validatedItem, ctx.connection)];
                    case 2:
                        id = _b.sent();
                        return [4 /*yield*/, dao.getOneById(id, ctx.connection)];
                    case 3:
                        item = _b.sent();
                        _a = ctx;
                        return [4 /*yield*/, outputFilter(ctx, item, ctx.connection)];
                    case 4:
                        _a.body = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        ctx.body = false;
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     *
     * @param {any} ctx
     * @param {any} id
     * @returns
     */
    var deleteHandler = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var item, shouldDelete;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dao.getOneById(id, ctx.connection)];
                    case 1:
                        item = _a.sent();
                        if (!item) {
                            ctx.body = true;
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, inputFilter(ctx, undefined, item)];
                    case 2:
                        shouldDelete = _a.sent();
                        if (!shouldDelete) return [3 /*break*/, 4];
                        return [4 /*yield*/, dao.remove(id, ctx.connection)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        ctx.body = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     *
     * @param {any} ctx
     * @param {String} id
     */
    var getByIdHandler = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var item, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dao.getOneById(id, ctx.connection)];
                    case 1:
                        item = _b.sent();
                        if (!item) return [3 /*break*/, 3];
                        _a = ctx;
                        return [4 /*yield*/, outputFilter(ctx, item)];
                    case 2:
                        _a.body = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        ctx.body = false;
                        _b.label = 4;
                    case 4:
                        if (!(ctx.query && ctx.query._fetch)) return [3 /*break*/, 6];
                        return [4 /*yield*/, _fetch(item, ctx.query._fetch, ctx.connection)];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    var updateHandler = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, item, updateSet, keys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = defaults(defaults({ id: id }, ctx.query), ctx.req.body);
                        return [4 /*yield*/, dao.getOneById(id, ctx.connection)];
                    case 1:
                        item = _a.sent();
                        if (!item) {
                            ctx.body = false;
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, inputFilter(ctx, updates, item)];
                    case 2:
                        updateSet = _a.sent();
                        if (!updateSet) {
                            ctx.body = false;
                            return [2 /*return*/];
                        }
                        keys = Object.keys(updateSet);
                        if (!(keys.length > 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, dao.saveOne(updateSet, ctx.connection)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        ctx.body = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    var searchHandler = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var query, keys, params, queryProps, pageSize, page, items, order, word, output, _i, items_1, item, out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = ctx.query;
                        keys = Object.keys(query);
                        params = {};
                        queryProps = [];
                        keys.forEach(function (key) {
                            if (key[0] === '_') {
                                params[key] = query[key];
                            }
                            else {
                                queryProps.push(key);
                            }
                        });
                        pageSize = parseInt(params._pageSize) || defaultPageSize;
                        if (pageSize > maxPageSize) {
                            pageSize = maxPageSize;
                        }
                        page = parseInt(params._page) || 0;
                        items = [];
                        order = defaultOrder;
                        if (query._order) {
                            if (query._direction && query._direction.toLowerCase().trim() === 'desc') {
                                order = _escapeName(query._order) + ' desc';
                            }
                            else {
                                order = _escapeName(query._order) + ' asc';
                            }
                        }
                        if (!!queryProps.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, dao.getAll(order, page, pageSize, ctx.connection)];
                    case 1:
                        //get all
                        items = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        word = '';
                        if (query.q) {
                            word = query.q;
                        }
                        return [4 /*yield*/, dao.search(word, query, order, page, pageSize, ctx.connection)];
                    case 3:
                        items = _a.sent();
                        _a.label = 4;
                    case 4:
                        output = [];
                        _i = 0, items_1 = items;
                        _a.label = 5;
                    case 5:
                        if (!(_i < items_1.length)) return [3 /*break*/, 8];
                        item = items_1[_i];
                        return [4 /*yield*/, outputFilter(ctx, item)];
                    case 6:
                        out = _a.sent();
                        if (out)
                            output.push(out);
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!query._fetch) return [3 /*break*/, 10];
                        return [4 /*yield*/, _fetch(output, query._fetch, ctx.connection)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        ctx.body = {
                            items: output,
                            count: output.length,
                            resultCount: items.resultCount,
                            pageCount: items.pageCount
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    var _fetch = function (items, extendNames, connection) {
        return __awaiter(this, void 0, void 0, function () {
            var wantedFields, fetchNames, _i, fetchNames_1, name;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wantedFields = extendNames.split(',');
                        fetchNames = intersection(wantedFields, fetchableFields);
                        _i = 0, fetchNames_1 = fetchNames;
                        _a.label = 1;
                    case 1:
                        if (!(_i < fetchNames_1.length)) return [3 /*break*/, 4];
                        name = fetchNames_1[_i];
                        return [4 /*yield*/, dao['fetch' + capitalize(name)](items, connection)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, items];
                }
            });
        });
    };
    if (allowChangesOnGet) {
        router.use(route.get('/create', createHandler));
        router.use(route.get('/delete/:id', deleteHandler));
        router.use(route.get('/update/:id', updateHandler));
    }
    router.use(route.post('/', createHandler));
    router.use(route["delete"]('/:id', deleteHandler));
    router.use(route.put('/:id', updateHandler));
    router.use(route.get('/:id', getByIdHandler));
    router.use(route.get('/', searchHandler));
    return router;
};
m.transactionMiddleware = function (db) {
    return function (ctx, next) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.beginTransaction()];
                    case 1:
                        connection = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 7]);
                        ctx.connection = connection;
                        //await db.save({id:'1',obj:'data'}, connection);
                        return [4 /*yield*/, next()];
                    case 3:
                        //await db.save({id:'1',obj:'data'}, connection);
                        _a.sent();
                        return [4 /*yield*/, connection.commit()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        e_1 = _a.sent();
                        return [4 /*yield*/, connection.rollback()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
};
function capitalize(s) {
    return s[0].toUpperCase() + s.substr(1);
}
function intersection(arrayA, arrayB) {
    var result = [];
    arrayA.forEach(function (item) {
        if ((arrayB.indexOf(item) !== -1) && result.indexOf(item) === -1) {
            result.push(item);
        }
    });
    return result;
}
;
function defaults(object, defaults) {
    var keys = Object.keys(defaults);
    keys.forEach(function (key) {
        if (typeof object[key] === 'undefined') {
            object[key] = defaults[key];
        }
    });
}
function getFetchableFields(dao) {
    console.assert(typeof dao === 'object');
    var fields = [];
    var keys = Object.keys(dao);
    keys.forEach(function (key) {
        if (key.indexOf('fetch') !== 0)
            return;
        var Name = key.substr(5);
        fields.push(Name[0].toLowerCase() + Name.substr(1));
    });
    return fields;
}
