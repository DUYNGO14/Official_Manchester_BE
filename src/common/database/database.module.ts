import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import mongoose from "mongoose";
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const portdb = configService.get<string>("MONGO_PORT");
        const username = configService.get<string>("MONGO_ROOT_USERNAME");
        const password = configService.get<string>("MONGO_ROOT_PASSWORD");
        const database = configService.get<string>("MONGO_DATABASE");

        const uri = `mongodb://${username}:${password}@localhost:${portdb}/${database}?authSource=admin`;
        if (!uri) {
          throw new Error("❌ Missing MONGO_URI in environment variables");
        }

        return {
          uri,
          retryAttempts: 3,
          retryDelay: 2000,
        };
      },
    }),
  ],
  exports: [],
  providers: [],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  onModuleInit() {
    this.logger.log("⏳ Waiting for MongoDB connection...");

    mongoose.connection.on("connected", () => {
      this.logger.log("✅ MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      this.logger.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      this.logger.warn("⚠️ MongoDB disconnected");
    });
  }

}