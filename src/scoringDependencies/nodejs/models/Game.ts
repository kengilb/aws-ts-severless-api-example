import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    IsUUID,
    HasMany,
} from 'sequelize-typescript';
import { ScoringEvent } from './ScoringEvent';

@Table
export class Game extends Model {

    @IsUUID(4)
    @PrimaryKey
    @Column(DataType.UUID)
    id!: string;

    @Column
    start!: Date;

    @Column
    end!: Date;

    @Column
    declare arrive: Date;

    @HasMany(() => ScoringEvent)
    declare scoringEvents: ScoringEvent[]

}
