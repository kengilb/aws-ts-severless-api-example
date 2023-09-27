export interface ScorekeepingData {
    code: ScorekeepingCode;
    attributes: {
        advancesCount: boolean;
        result: ScorekeepingResult;
    };
}

export enum ScorekeepingCode {
    Pitch = "pitch",
    Ball = "ball",
}

export enum ScorekeepingResult {
    BallInPlay = "ball_in_play",
    Strikeout = "strikeout",
}
