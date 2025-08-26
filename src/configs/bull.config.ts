// import { BullModule } from "@nestjs/bullmq";
// import { ConfigModule, ConfigService } from "@nestjs/config";
// import { ENVEnum } from "@project/common/enum/env.enum";

// const BullConfig = BullModule.forRootAsync({
//     imports: [ConfigModule],
//     inject: [ConfigService],
//     useFactory: async (configService: ConfigService) => {
//         return {
//             connection: {
//                 url: configService.getOrThrow<string>(ENVEnum.REDIS_URL),
//             }
//         };
//     },
// })
// export default BullConfig;
