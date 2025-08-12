import { Sequelize } from "sequelize";
import chalk from "chalk";

// MilkFactory
// Testing_Milk_Factory
const sequelize = new Sequelize("db name", "db user", "db password", {
    host: "db host",
    dialect: "mysql",
    timezone: '+05:30',
    logging: (query) => {
        console.log(`\n \n   Query => ${query} \n `);
    },
    logQueryParameters: true,
    dialectOptions: {
        connectTimeout: 60000
    },
    benchmark: false,
    pool: {
        max: 20, // maximum number of connection in pool
        min: 0, // minimum number of connection in pool
        acquire: 60000, // maximum time (in milliseconds) to try getting a connection before throwing error
        idle: 10000, // time (in milliseconds) a connection can be idle before being released
    },
});

const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully  👍 ✅ ✅ ✅");
        // await sequelize.sync({ alter: true });
        // await sequelize.sync();
        console.log(
            "\n ",
            chalk.green.bgGreen(
                "All tables created successfully if they did not exist."
            ),
            "\n "
        );
    } catch (error) {
        console.error("Error connecting to the database 🔴 :", error);
    }
};

export { connectDb, sequelize };
