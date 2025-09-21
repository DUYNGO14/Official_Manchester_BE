import { Session } from '@/modules/sessions/schemas/session.schema';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}
  async create(
    userId: ObjectId,
    refreshToken: string,
    device: string,
    expiresAt: Date,
  ) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // 1. Upsert session theo device
    const sessionId = await this.upsertSession(
      userId,
      device,
      tokenHash,
      expiresAt,
    );

    // 2. Giữ tối đa 3 sessions
    await this.revokeOldSessions(userId);

    return sessionId;
  }

  private async upsertSession(
    userId: ObjectId,
    device: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    const existingSession = await this.sessionModel.findOne({
      user: userId,
      device,
      revoked: false,
    });

    if (existingSession) {
      existingSession.refreshToken = tokenHash;
      existingSession.expiresAt = expiresAt;
      await existingSession.save();
      return existingSession._id;
    } else {
      const session = await this.sessionModel.create({
        refreshToken: tokenHash,
        expiresAt,
        device,
        user: userId,
      });
      return session._id;
    }
  }

  private async revokeOldSessions(userId: ObjectId) {
    const tokens = await this.sessionModel
      .find({ user: userId, revoked: false })
      .sort({ createdAt: -1 });

    if (tokens.length > 3) {
      const oldTokens = tokens.slice(3);
      await this.sessionModel.updateMany(
        { _id: { $in: oldTokens.map((t) => t._id) } },
        { revoked: true },
      );
    }
  }

  async update(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    device: string,
  ) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.sessionModel.updateOne(
      { user: userId, device, revoked: false },     
      { refreshToken: tokenHash, expiresAt },
    );
  }
  async validate(
    userId: string,
    refreshToken: string,
    device: string,
  ): Promise<boolean> {
    try {
      if (!mongoose.isValidObjectId(userId)) return false;

      const session = await this.sessionModel
        .findOne({
          user: new mongoose.Types.ObjectId(userId),
          device,
          revoked: false,
        })
        .lean()
        .exec();

      if (!session) return false;

      // Kiểm tra token hết hạn chưa
      const now = new Date();
      if (dayjs(session.expiresAt).isBefore(now)) {
        return false;
      }
      // So sánh refreshToken
      const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
      return isMatch;
    } catch (error) {
      throw error;
    }
  }

  async revoke(userId: string, device: string): Promise<void> {
    const session = await this.sessionModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
      device,
      revoked: false,
    });

    if (!session) throw new NotFoundException('Session not found');

    session.revoked = true;
    await session.save();
  }
}
