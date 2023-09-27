import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
    IsUUID,
    BelongsTo,
    HasOne,
} from 'sequelize-typescript';
import { Game } from './Game';
import { ScorekeepingData } from './ScorekeepingData';

@Table
export class ScoringEvent extends Model {

    @IsUUID(4)
    @PrimaryKey
    @Column(DataType.UUID)
    id!: string;

    @Column
    timestamp!: Date;

    @IsUUID(4)
    @ForeignKey(() => Game)
    @Column(DataType.UUID)
    gameId!: string;

    @BelongsTo(() => Game)
    game!: Game;

    @HasOne(() => ScorekeepingData)
    data!: ScorekeepingData;

}
