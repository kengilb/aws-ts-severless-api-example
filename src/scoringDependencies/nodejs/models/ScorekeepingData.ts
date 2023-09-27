import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    IsUUID,
    BelongsTo,
    HasOne,
} from 'sequelize-typescript';
import { ScoringEvent } from './ScoringEvent';

@Table
export class ScorekeepingData extends Model {

    @Column({
        type: DataType.ENUM('pitch', 'ball'),
    })
    code!: string;

    @ForeignKey(() => ScoringEvent)
    @IsUUID(4)
    @Column(DataType.UUID)
    scoringEventId!: string;

    @Column(DataType.JSONB)
    attributes!: string

    @BelongsTo(() => ScoringEvent)
    scoringEvent!: ScoringEvent;

}
