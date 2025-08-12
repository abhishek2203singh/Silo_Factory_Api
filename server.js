import { Server as socketIo } from "socket.io";
import http from "http";
import chalk from "chalk";
import express from "express";
import busboy from "connect-busboy";
import awsuploader from "./src/utility/aws3.util.js";
import { connectDb } from "./src/config/dbConfig.js";
import Routers from "./src/routes/index.routes.js";
import { updateSocketToken } from "./src/middlewares/updateSocketToken.middleware.js";
import { auth } from "./src/middlewares/auth.middleware.js";
import { config } from "./src/config/config.js";
import cors from "cors";
import moment from "./node_modules/moment/moment.js";

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";

const app = express();

const server = http.createServer(app);
const io = new socketIo(server, {
    cors: {
        origin: ["http://localhost:2121",],
        methods: ["GET", "POST"]
    }
});

// cors setup for single origin
// app.use(cors({ origin: config.corsOrigin }));

// cors setup for multiple origins
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || config.corsOrigin.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

app.use(express.json());

app.use(busboy({ highWaterMark: 2 * 1024 * 1024 }));


app.post("/fileUpload", async (req, res) => {
    try {
        console.log("File Upload Request Received", req.busboy);
        req.pipe(req.busboy);
        req.busboy.on("file", async (fieldname, file, filename) => {
            var data = await awsuploader.fileuploader(file, filename);
            res.send(data);
            console.log("upload response =>", data)
        });
    } catch (error) {
        console.log("Error while uploading file =>", error)
    }
}); // middleware to log each event / request

io.use((socket, next) => {
    const newConnection = {
        IP: socket.request.connection.remoteAddress,
        socketId: socket.id,
    };
    console.log(
        "\n",
        chalk.bgGreen.white(" new connection from => "),
        newConnection
    );

    next();
});

const originalEmit = io.emit.bind(io);
io.emit = (...args) => {
    console.log("Emit:", args);
    originalEmit(...args);
};

// Handle socket connections
io.on("connection", async (socket) => {
    const authToken = socket?.handshake?.headers?.token;

    if (authToken != "NA" && authToken != undefined && authToken.length > 500) {
        updateSocketToken(authToken, true, socket);
    }

    //  to keep refference of original emit
    const originalEmit = socket.emit;
    const originalBroadcastEmit = socket.broadcast.emit;

    socket.broadcast.emit = function (event, ...args) {
        console.log(
            "\n ",
            chalk.bgHex("#f45b69").black.bold(` Broadcast Emit => `, event, " "),
            "\n "
        );

        originalBroadcastEmit.apply(this, [event, ...args]);
    };

    //   to log each emit event
    socket.emit = function (event, ...args) {
        console.log(
            "\n ",
            chalk
                .bgHex("#0466c8")
                .black.bold(` Emit => `, event, "     ", moment(), " "),
            "\n "
        );
        originalEmit.apply(this, [event, ...args]);
    };

    socket.use((event, next) => {
        console.log(
            "\n ",
            chalk
                .bgHex("#F3BA2F")
                .black.bold(` Event => `, event[0], "     ", moment(), " "),
            "\n "
        );
        socket.route = event[0];
        // authentication
        auth(socket, event[0], next);
    });

    Routers(io, socket);
    socket.on("disconnect", () => {
        const authToken = socket?.handshake?.headers?.token;
        if (authToken != "NA" && authToken != undefined && authToken.length > 500) {
            console.log("auth token =>", authToken);
            updateSocketToken(authToken, false, socket);
        }

        // console.log("\n ", chalk.bgRed.white.bold("Disconnected from => "), {
        //     socketId: socket.id,
        //     userName: socket?.userName,
        //     authToken,
        // });
    });
});

// Start the server
server.listen(4850, async (error) => {
    await connectDb(); // Connect to database
    if (error) {
        console.error("Error starting server:", error);
    } else {
        // Cron_schduler.RegularSchduler();
        console.log("Server running on port 4850");
    }
});

export { io };
