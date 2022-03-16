const url = require('url');
var database = require("mongodb").MongoClient;
var mongo = require("mongodb");
const dbUrl = "mongodb://localhost/Games";

exports.get = function(req, res) {
    const reqUrl = url.parse(req.url, true);
    var id = ""
    if (reqUrl.query.id) {
        id = reqUrl.query.id
    }
    database.connect(dbUrl, function(err, client) {
        var db = client.db();
        const collection = db.collection('Games');
        if (id !== "") {
            try {
                var o_id = new mongo.ObjectId(id);
            } catch {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ "message": "Invalid id." }));
                client.close();
                return;
            }
            collection.find({ '_id': o_id }).toArray(function(err, docs) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "message": "An internal error occured." }));
                    client.close();
                    return;
                }
                if (docs) {
                    if (docs.length == 0) {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ "message": "Invalid id." }));
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(docs));
                    }
                }
                client.close();
            })
        } else {
            collection.find({}).toArray(function(err, docs) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "message": "An internal error occured." }));
                    client.close();
                    return;
                }
                if (docs) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(docs));
                }
                client.close();
            })
        }
    });
};

exports.post = function(req, res) {
    const reqUrl = url.parse(req.url, true);
    var id = ""
    if (reqUrl.query.id) {
        id = reqUrl.query.id
    }
    if (id != "") {
        database.connect(dbUrl, function(err, client) {
            var db = client.db();
            const collection = db.collection('Games');
            try {
                var o_id = new mongo.ObjectId(id);
            } catch {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ "message": "Invalid id." }));
                client.close();
                return;
            }
            collection.find({ '_id': o_id }).toArray(function(err, docs) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "message": "An internal error occured." }));
                    client.close();
                    return;
                }
                if (docs) {
                    if (docs.length == 0) {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ "message": "Invalid id." }));
                        client.close();
                        return;
                    } else {
                        res.statusCode = 409;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ "message": "Conflict." }));
                        client.close();
                        return;
                    }
                }
            });
        });
    } else {
        var body = "";
        req.on('data', (chunk) => {
            body += chunk;
        }).on('end', () => {
            database.connect(dbUrl, function(err, client) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "message": "An internal error occured." }));
                    client.close();
                    return;
                }
                var db = client.db();
                let parsed = JSON.parse(body);
                db.collection('Games').find(parsed).toArray(function(err, docs) {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ "message": "An internal error occured." }));
                        client.close();
                        return;
                    }
                    if (docs) {
                        if (docs.length == 0) {
                            db.collection('Games').insertOne(parsed, function(error, response) {
                                if (error) {
                                    res.statusCode = 500;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ "message": "An internal error occured." }));
                                    client.close();
                                    return;
                                } else {
                                    db.collection('Games').find(parsed).toArray(function(err, docs) {
                                        if (err) {
                                            res.statusCode = 500;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.end(JSON.stringify({ "message": "An internal error occured." }));
                                            client.close();
                                            return;
                                        }
                                        if (docs) {
                                            if (docs.length == 0) {
                                                res.statusCode = 404;
                                                res.setHeader('Content-Type', 'application/json');
                                                res.end(JSON.stringify({ "message": "Invalid id." }));
                                                client.close();
                                                return;
                                            } else {
                                                res.statusCode = 201;
                                                res.setHeader('Content-Type', 'application/json');
                                                res.setHeader('Location', req.url + '?id=' + docs[0]._id);
                                                res.end(JSON.stringify({ "message": "Creation succesful" }));
                                                client.close();
                                                return;
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            res.statusCode = 409;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ "message": "Game already exists." }));
                            client.close();
                            return;
                        }
                    }
                });
            });
        });
    }
};
exports.put = function(req, res) {
    const reqUrl = url.parse(req.url, true);
    var id = ""
    if (reqUrl.query.id) {
        id = reqUrl.query.id
    }

    var body = "";
    req.on('data', (chunk) => {
        body += chunk;
    }).on('end', () => {

        database.connect(dbUrl, function(err, client) {
            let parsed = JSON.parse(body)
            var db = client.db();
            const collection = db.collection('Games');
            if (id !== "") {
                try {
                    var o_id = new mongo.ObjectId(id);
                } catch {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "message": "Invalid id." }));
                    client.close();
                    return;
                }
                collection.find({ '_id': o_id }).toArray(function(err, docs) {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ "message": "An internal error occured." }));
                        return;
                    }
                    if (docs) {
                        if (docs.length == 0) {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ "message": "Invalid id." }));
                            client.close();
                            return;
                        } else {
                            collection.updateOne({ "_id": o_id }, { $set: parsed }, function(err, resp) {
                                if (err) {
                                    res.statusCode = 500;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ "message": "An internal error occured." }));
                                } else {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ "message": "Update succesful" }));
                                }
                                client.close();
                            });
                        }
                    }
                });

            } else {
                collection.drop(function(err, delOK) {})
                collection.insertMany(parsed, function(error, response) {
                    if (error) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ "message": "An internal error occured." }));
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ "message": "Update succesful" }));
                    }
                    client.close();
                });
            }
        })
    })
};
exports.delete = function(req, res) {
    const reqUrl = url.parse(req.url, true);
    var id = ""
    if (reqUrl.query.id) {
        id = reqUrl.query.id
    }
    database.connect(dbUrl, function(err, client) {
        var db = client.db();
        const collection = db.collection('Games');
        if (id !== "") {
            try {
                var o_id = new mongo.ObjectId(id);
            } catch {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ "message": "Invalid id." }));
                return;
            }
            collection.find({ '_id': o_id }).toArray(function(err, docs) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "message": "An internal error occured." }));
                    return;
                }
                if (docs) {
                    if (docs.length == 0) {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ "message": "Invalid id." }));
                        client.close();
                        return;
                    } else {
                        collection.deleteOne({ '_id': o_id }, function(err, response) {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ "message": "Game deleted" }));
                            client.close();
                        })
                    }
                }
            });
        } else {
            collection.drop(function(err, delOK) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ "message": "Games deleted" }));
                client.close();
            })
        }
    });
};

exports.invalidRequest = function(req, res) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end(JSON.stringify({ "message": "Not found." }));
};

exports.invalidMethod = function(req, res) {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain');
    res.end(JSON.stringify({ "message": "Method not allowed." }));
};