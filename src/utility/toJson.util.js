const jsonFormator = (sequelizeResult) => {
    // console.log("sequelizeResult =>", sequelizeResult);
    if (Array.isArray(sequelizeResult)) {
        return sequelizeResult.map((item) => item.toJSON());
    }
    return sequelizeResult ? sequelizeResult.toJSON() : null;
};

export { jsonFormator };
