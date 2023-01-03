import { Sequelize } from "sequelize";
import { loadSequelize } from "../db-connect";

let sequelize: Sequelize;

loadSequelize().then(({sequelizeDB}) => sequelize = sequelizeDB);
// error is being evoked due to unexpected break of the connection by library

export { sequelize };
