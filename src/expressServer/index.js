import express from "express";
import morgan from "morgan";
import cors from "cors";
import rules from "./routes/rules.js";

//inicializaciones
const app = express();

//configuraciones
app.set("port", process.env.PORT || 4000);

//Middleware
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//VARIABLES GLOBALES

//RUTAS
app.use("/api/rules", rules);

//Public

//INICIAR EL SERVIDOR

const expressServer = {
  run: () => {
    app.listen(app.get("port"), () => {
      console.log("Express server running on port", app.get("port"));
    });
  },
};

export default expressServer;
