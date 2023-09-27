"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Game_1 = require("../models/Game");
const ScorekeepingData_1 = require("../models/ScorekeepingData");
const ScorekeepingDataAttributes_1 = require("../models/ScorekeepingDataAttributes");
const ScoringEvent_1 = require("../models/ScoringEvent");
exports.sequelize = new sequelize_typescript_1.Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres',
    models: [Game_1.Game, ScorekeepingData_1.ScorekeepingData, ScorekeepingDataAttributes_1.ScorekeepingDataAttributes, ScoringEvent_1.ScoringEvent],
});
//# sourceMappingURL=sequelize.js.map