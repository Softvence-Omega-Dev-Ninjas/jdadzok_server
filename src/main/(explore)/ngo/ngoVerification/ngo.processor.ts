// import { PrismaService } from "@lib/prisma/prisma.service";
// import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
// import { Processor, WorkerHost } from "@nestjs/bullmq";
// import { InternalServerErrorException, Logger } from "@nestjs/common";
// import IdAnalyzer from "idanalyzer2";

// const { Profile, Scanner, APIError, InvalidArgumentException } = IdAnalyzer;

// @Processor(QUEUE_JOB_NAME.VERIFICATION.NGO_VERIFICATION_PROCESSOR)
// export class NgoVerificationProcessor extends WorkerHost {
//     private readonly logger = new Logger(NgoVerificationProcessor.name);

//     constructor(private readonly prisma: PrismaService) {
//         super();
//     }

//     async process(job: any): Promise<any> {
//         if (job.name !== QUEUE_JOB_NAME.VERIFICATION.NGO_VERIFICATION) return;

//         const { verificationId, documentUrls, verificationType } = job.data;

//         this.logger.log(` Processing NGO verification for ID: ${verificationId}`);
//         this.logger.debug(`Job data: ${JSON.stringify(job.data, null, 2)}`);

//         try {
//             const apiKey = process.env.IDANALYZER_API_KEY;
//             if (!apiKey) throw new Error("Missing IDAnalyzer API key");

//             const scanner = new Scanner(apiKey);
//             scanner.throwApiException(true);

//             // Optional: set a verification profile
//             const profile = new Profile(Profile.SECURITY_MEDIUM);
//             scanner.setProfile(profile);

//             // Scan the document (URL or base64 string)
//             const scanResult = await scanner.quickScan(documentUrls[0]);

//             const status =
//                 scanResult?.result === "match" || scanResult?.document?.valid
//                     ? "APPROVED"
//                     : "REJECTED";

//             await this.prisma.ngoVerification.update({
//                 where: { id: verificationId },
//                 data: {
//                     status,
//                     verificationResponse: scanResult,
//                 },
//             });

//             this.logger.log(
//                 ` NGO verification complete: ${verificationId} (${status})`,
//             );

//             return scanResult;
//         } catch (e: any) {
//             let errMsg: string;

//             if (e instanceof InvalidArgumentException) errMsg = e.message;
//             else if (e instanceof APIError) errMsg = `${e.code} - ${e.msg}`;
//             else errMsg = e.message;

//             this.logger.error(` Failed to verify NGO (${verificationId}): ${errMsg}`);

//             await this.prisma.ngoVerification.update({
//                 where: { id: verificationId },
//                 data: {
//                     status: "REJECTED",
//                     verificationResponse: { error: errMsg },
//                 },
//             });

//             throw new InternalServerErrorException(errMsg);
//         }
//     }
// }



import { PrismaService } from "@lib/prisma/prisma.service";
import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import IdAnalyzer from "idanalyzer2";

const { Profile, Scanner, APIError, InvalidArgumentException } = IdAnalyzer;

@Processor(QUEUE_JOB_NAME.VERIFICATION.NGO_VERIFICATION_PROCESSOR)
export class NgoVerificationProcessor extends WorkerHost {
    private readonly logger = new Logger(NgoVerificationProcessor.name);

    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async process(job: any): Promise<any> {
        if (job.name !== QUEUE_JOB_NAME.VERIFICATION.NGO_VERIFICATION) return;

        const { verificationId, documentUrls, verificationType } = job.data;

        console.log(`Processing NGO verification for ID: ${verificationId}`);

        try {
            const apiKey = process.env.IDANALYZER_API_KEY;
            if (!apiKey) throw new Error("Missing IDAnalyzer API key");

            const scanner = new Scanner(apiKey);
            scanner.throwApiException(true);

            // Optional security profile
            const profile = new Profile(Profile.SECURITY_MEDIUM);
            scanner.setProfile(profile);

            // ---- SCAN ----
            const scanResult = await scanner.quickScan(documentUrls[0]);
            console.log(
                `Screen result: ${JSON.stringify(scanResult, null, 2)}`,
            );

            // ---- DECISION LOGIC ----

            const decision = scanResult?.decision?.toLowerCase();
            const status = decision === "accept" ? "APPROVED" : "REJECTED";

            // ---- PERSIST ----
            await this.prisma.ngoVerification.update({
                where: { id: verificationId },
                data: {
                    status,
                    verificationResponse: scanResult as any,
                    verificationType,
                },
            });

            console.log(
                `NGO verification complete: ${verificationId} (${status})`,
            );

            return scanResult;
        } catch (e: any) {
            let errMsg: string;

            if (e instanceof InvalidArgumentException) errMsg = e.message;
            else if (e instanceof APIError) errMsg = `${e.code} - ${e.msg}`;
            else errMsg = e?.message ?? "Unknown error";

            console.log(
                `Failed to verify NGO (${verificationId}): ${errMsg}`,
            );

            await this.prisma.ngoVerification.update({
                where: { id: verificationId },
                data: {
                    status: "REJECTED",
                    verificationResponse: { error: errMsg },
                    verificationType,
                },
            });

            throw new InternalServerErrorException(errMsg);
        }
    }
}