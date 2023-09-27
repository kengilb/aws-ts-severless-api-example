import { ScorekeepingData } from './scorekeepingData';
export interface ScoringEvent {
    id: string;
    gameId: string;
    timestamp: Date;
    data: ScorekeepingData;
}
