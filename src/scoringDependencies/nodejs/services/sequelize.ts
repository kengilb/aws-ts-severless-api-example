import { Sequelize } from 'sequelize-typescript';
import { Game } from '../models/Game';
import { ScorekeepingData } from '../models/ScorekeepingData';
import { ScoringEvent } from '../models/ScoringEvent';

export const sequelize = new Sequelize(<string>process.env.POSTGRES_URL, {
    dialect: 'postgres',
    models: [Game, ScorekeepingData, ScoringEvent],
});
